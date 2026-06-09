import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getCached, setCached } from '@/lib/scraper-cache';

export interface NewsletterSubscription {
  id: string;
  userId: string;
  email: string;
  frequency: 'daily' | 'weekly' | 'instant';
  industryFilters: string[];
  regionFilters: string[];
  tenderAlerts: boolean;
  newsAlerts: boolean;
  createdAt: Date;
  lastSentAt: Date | null;
  active: boolean;
}

export interface DigestContent {
  topStories: Array<{ headline: string; summary: string; source: string; url: string; category: string }>;
  relevantTenders: Array<{ title: string; org: string; value: string; deadline: string; url: string; sector: string }>;
  industryInsight: string;
  upcomingDeadlines: Array<{ tender: string; deadline: string; daysLeft: number }>;
}

const gateway = new AIGateway();

export const newsletterSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'instant']),
  industryFilters: z.array(z.string()).default([]),
  regionFilters: z.array(z.string()).default(['Zimbabwe']),
  tenderAlerts: z.boolean().default(true),
  newsAlerts: z.boolean().default(true),
});
export type NewsletterPreferences = z.infer<typeof newsletterSchema>;

export async function subscribeUser(
  userId: string,
  email: string,
  preferences: NewsletterPreferences
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    const subRef = adminDb.doc(`newsletter_subscriptions/${userId}`);
    const data: Omit<NewsletterSubscription, 'id'> & { userId: string } = {
      userId,
      email,
      frequency: preferences.frequency,
      industryFilters: preferences.industryFilters,
      regionFilters: preferences.regionFilters,
      tenderAlerts: preferences.tenderAlerts,
      newsAlerts: preferences.newsAlerts,
      createdAt: new Date(),
      lastSentAt: null,
      active: true,
    };

    await subRef.set({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      lastSentAt: null,
    });

    return { success: true, subscriptionId: userId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Newsletter] Subscribe error:', message);
    throw new Error(message);
  }
}

export async function updatePreferences(
  userId: string,
  preferences: Partial<NewsletterPreferences>
): Promise<{ success: boolean }> {
  const subRef = adminDb.doc(`newsletter_subscriptions/${userId}`);
  await subRef.set({ ...preferences, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { success: true };
}

export async function getUserSubscription(userId: string): Promise<NewsletterSubscription | null> {
  const snap = await adminDb.doc(`newsletter_subscriptions/${userId}`).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    lastSentAt: data.lastSentAt?.toDate() || null,
  } as NewsletterSubscription;
}

export async function generateDigestForUser(
  userId: string,
  forceRefresh = false
): Promise<DigestContent> {
  const cacheKey = `digest:user:${userId}`;
  if (!forceRefresh) {
    const cached = getCached<DigestContent>(cacheKey);
    if (cached) return cached;
  }

  const sub = await getUserSubscription(userId);
  if (!sub) throw new Error('No subscription found');

  const { getNewsForUser } = await import('@/services/news-scraper');
  const { getTendersForUser } = await import('@/services/tender-scraper');

  const news = await getNewsForUser(userId);
  const tenders = await getTendersForUser(userId);

  const industryContext = sub.industryFilters.join(', ') || sub.tenderAlerts ? 'mixed sectors' : 'general';

  const newsSection = news.slice(0, 8).map(n =>
    `[${n.category.toUpperCase()}] ${n.title}\nSource: ${n.sourceName} | ${n.publishedAt.toLocaleDateString('en-GB')}\n${(n.summary || 'No summary available.').slice(0, 300)}`
  ).join('\n\n');

  const tenderSection = tenders.filter(t => t.status !== 'closed').slice(0, 6).map(t =>
    `${t.title}\nOrganisation: ${t.organization}\nValue: ${t.value || 'Not specified'} | Closes: ${t.closingDate ? new Date(t.closingDate).toLocaleDateString('en-GB') : 'See source'}\nSector: ${t.sector}\nLink: ${t.sourceUrl}`
  ).join('\n\n');

  const prompt = `Generate a weekly business intelligence digest for a ${industryContext} business owner in ${sub.regionFilters.join(', ') || 'Zimbabwe'}.

CURRENT NEWS:
${newsSection || 'No recent news available.'}

ACTIVE TENDER OPPORTUNITIES:
${tenderSection || 'No tenders available.'}

Generate a JSON digest with these exact keys:
{
  "topStories": [{ "headline": "...", "summary": "...", "source": "...", "url": "...", "category": "..." }],
  "relevantTenders": [{ "title": "...", "org": "...", "value": "...", "deadline": "...", "url": "...", "sector": "..." }],
  "industryInsight": "A 2-3 sentence market insight relevant to the user's industry.",
  "upcomingDeadlines": [{ "tender": "...", "deadline": "...", "daysLeft": 0 }]
}

Only include tenders with deadline within 30 days. Be specific and actionable.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt: 'You are a business intelligence analyst. Return ONLY valid JSON matching the specified schema.',
    difficulty: 'complex',
    maxTokens: 1536,
    temperature: 0.3,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(result.content);
    const digest: DigestContent = {
      topStories: parsed.topStories || [],
      relevantTenders: parsed.relevantTenders || [],
      industryInsight: parsed.industryInsight || '',
      upcomingDeadlines: (parsed.upcomingDeadlines || []).filter((d: any) => d.daysLeft > 0 && d.daysLeft <= 30),
    };

    setCached(cacheKey, digest, 30 * 60 * 1000);
    return digest;
  } catch {
    return {
      topStories: news.slice(0, 5).map(n => ({
        headline: n.title,
        summary: (n.summary || '').slice(0, 300),
        source: n.sourceName,
        url: n.sourceUrl || '',
        category: n.category,
      })),
      relevantTenders: tenders.filter(t => t.status !== 'closed').slice(0, 5).map(t => ({
        title: t.title,
        org: t.organization,
        value: t.value || 'See source',
        deadline: t.closingDate ? new Date(t.closingDate).toLocaleDateString('en-GB') : 'Check source',
        url: t.sourceUrl,
        sector: t.sector,
      })),
      industryInsight: `Found ${tenders.length} tender opportunities and ${news.length} news articles relevant to your sector.`,
      upcomingDeadlines: [],
    };
  }
}

export async function markDigestSent(userId: string): Promise<void> {
  const subRef = adminDb.doc(`newsletter_subscriptions/${userId}`);
  await subRef.set({ lastSentAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function getSubscribersForDigest(frequency: 'daily' | 'weekly'): Promise<NewsletterSubscription[]> {
  const snapshot = await adminDb
    .collection('newsletter_subscriptions')
    .where('frequency', '==', frequency)
    .where('active', '==', true)
    .get();

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastSentAt: data.lastSentAt?.toDate() || null,
    } as NewsletterSubscription;
  });
}