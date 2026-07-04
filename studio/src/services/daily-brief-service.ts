import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { generateDigestForUser } from '@/services/newsletter-service';
import { enqueueOutboundMessage } from '@/services/whatsapp/outbound-queue';

const BRIEF_SUBSCRIPTIONS = 'whatsapp_briefs';

export interface WhatsAppBriefSubscription {
  userId: string;
  phoneNumber: string;
  active: boolean;
  frequency: 'daily' | 'weekly';
  timezone: string;
  preferredTime: string;
  lastSentAt: Date | null;
  createdAt: Date;
}

export async function subscribeToWhatsAppBriefs(
  userId: string,
  phoneNumber: string,
  frequency: 'daily' | 'weekly' = 'daily',
): Promise<boolean> {
  const ref = adminDb.collection(BRIEF_SUBSCRIPTIONS).doc(userId);
  await ref.set({
    userId,
    phoneNumber,
    active: true,
    frequency,
    timezone: 'Africa/Harare',
    preferredTime: '07:00',
    lastSentAt: null,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  return true;
}

export async function unsubscribeFromWhatsAppBriefs(userId: string): Promise<boolean> {
  await adminDb.collection(BRIEF_SUBSCRIPTIONS).doc(userId).update({ active: false });
  return true;
}

export async function getWhatsAppBriefSubscribers(frequency: 'daily' | 'weekly'): Promise<WhatsAppBriefSubscription[]> {
  const snap = await adminDb
    .collection(BRIEF_SUBSCRIPTIONS)
    .where('active', '==', true)
    .where('frequency', '==', frequency)
    .get();

  return snap.docs.map(d => d.data() as WhatsAppBriefSubscription);
}

export async function sendDailyBriefToUser(userId: string, phoneNumber: string): Promise<boolean> {
  try {
    const digest = await generateDigestForUser(userId, true);

    const topTender = digest.relevantTenders[0];
    const deadlineAlerts = digest.upcomingDeadlines.filter(d => d.daysLeft <= 7);

    const messageLines = [
      `*Radbit Daily Brief — ${new Date().toLocaleDateString('en-ZW', { weekday: 'long', day: 'numeric', month: 'short' })}*`,
      '',
    ];

    if (digest.topStories.length > 0) {
      messageLines.push(`*Top Stories:*`);
      digest.topStories.slice(0, 2).forEach(s => {
        messageLines.push(`• ${s.headline}`);
      });
      messageLines.push('');
    }

    if (topTender) {
      messageLines.push(`*Featured Tender:*`);
      messageLines.push(`• ${topTender.title}`);
      messageLines.push(`  ${topTender.org} | ${topTender.value} | Deadline: ${topTender.deadline}`);
      messageLines.push('');
    }

    if (deadlineAlerts.length > 0) {
      messageLines.push(`*⚠️ Deadline Alerts:*`);
      deadlineAlerts.slice(0, 3).forEach(d => {
        messageLines.push(`• ${d.tender} — ${d.daysLeft} day${d.daysLeft === 1 ? '' : 's'} left`);
      });
      messageLines.push('');
    }

    if (digest.industryInsight) {
      messageLines.push(`*Market Insight:*`);
      messageLines.push(digest.industryInsight.slice(0, 200));
      messageLines.push('');
    }

    messageLines.push(`_Reply TAX to talk to Mai Chipo (tax advisor)_`);
    messageLines.push(`_Reply TENDER to search opportunities_`);
    messageLines.push(`_Radbit — built for the SADC reality_`);

    const message = messageLines.join('\n');

    await enqueueOutboundMessage(
      userId,
      phoneNumber,
      'assessment_results_ready',
      { message },
      0,
    );

    await adminDb.collection(BRIEF_SUBSCRIPTIONS).doc(userId).update({
      lastSentAt: FieldValue.serverTimestamp(),
    });

    return true;
  } catch (err) {
    console.error(`[DailyBrief] Failed for ${userId}:`, err);
    return false;
  }
}

export async function sendBulkDailyBriefs(frequency: 'daily' | 'weekly'): Promise<{ sent: number; failed: number }> {
  const subscribers = await getWhatsAppBriefSubscribers(frequency);
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const ok = await sendDailyBriefToUser(sub.userId, sub.phoneNumber);
    if (ok) sent++;
    else failed++;
  }

  return { sent, failed };
}
