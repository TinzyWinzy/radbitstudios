'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';
import { getNewsForUser } from '@/services/news-scraper';
import { getTendersForUser } from '@/services/tender-scraper';

const PersonalizedBriefInputSchema = z.object({
  userId: z.string(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDescription: z.string().optional(),
  focusArea: z.enum(['news', 'tenders', 'both']).default('both'),
});
export type PersonalizedBriefInput = z.infer<typeof PersonalizedBriefInputSchema>;

const PersonalizedBriefOutputSchema = z.object({
  topStories: z.array(z.object({
    headline: z.string(),
    whyItMatters: z.string(),
    actionStep: z.string(),
    source: z.string(),
  })),
  relevantTenders: z.array(z.object({
    title: z.string(),
    whyRelevant: z.string(),
    howToApply: z.string(),
    deadline: z.string(),
  })),
  regulatoryAlert: z.string().optional(),
  summary: z.string(),
});
export type PersonalizedBriefOutput = z.infer<typeof PersonalizedBriefOutputSchema>;

const gateway = new AIGateway();

export async function generatePersonalizedBrief(input: PersonalizedBriefInput): Promise<PersonalizedBriefOutput> {
  const news = await getNewsForUser(input.userId);
  const tenders = await getTendersForUser(input.userId);

  const profile = [
    input.businessName ? `Business: ${input.businessName}` : '',
    input.industry ? `Industry: ${input.industry}` : '',
    input.businessDescription ? `Description: ${input.businessDescription}` : '',
  ].filter(Boolean).join(' | ');

  const newsContext = news.slice(0, 10).map((n, i) =>
    `${i + 1}. [${n.sourceName}] ${n.title}\n   ${(n.summary || '').slice(0, 200)}...`
  ).join('\n\n');

  const tenderContext = tenders.slice(0, 8).map((t, i) =>
    `${i + 1}. ${t.title}\n   Org: ${t.organization || 'TBC'} | Value: ${t.value || 'TBC'} | Closes: ${t.closingDate ? new Date(t.closingDate).toLocaleDateString('en-GB') : 'TBC'}\n   ${(t.description || '').slice(0, 200)}...`
  ).join('\n\n');

  const systemPrompt = `You are Tendai "The Bloodhound" Makoni, ex-RBZ analyst. Short, punchy sentences. Call important news "mhepo" — "I can feel which way the mhepo is blowing." Ruthlessly filter noise: if it doesn't affect their money, discard it. Structure like a CIA brief: "What happened" → "Why it matters to YOU" → "One thing before Friday." Regulatory alerts with gravity — you've seen businesses shut down for missed deadlines. Summary under 3 sentences. Output as JSON: topStories (headline, whyItMatters, actionStep, source), relevantTenders (title, whyRelevant, howToApply, deadline), regulatoryAlert (optional), summary.`;

  const prompt = `Business Profile: ${profile || 'Not set - focus on general Zimbabwe business news'}

LATEST NEWS (relevant to this business):
${newsContext || 'No recent news found for this industry.'}

LIVE TENDER OPPORTUNITIES:
${tenderContext || 'No tenders found for this industry.'}

Generate a personalized briefing for this business owner.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    maxTokens: 1024,
    temperature: 0.3,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(result.content);
    const validated = PersonalizedBriefOutputSchema.safeParse(parsed);
    if (validated.success) return validated.data;
  } catch { /* fall through */ }

  return {
    topStories: [],
    relevantTenders: tenders.slice(0, 3).map(t => ({
      title: t.title,
      whyRelevant: `Matches your ${input.industry || 'business'} sector.`,
      howToApply: `Visit ${t.sourceUrl} for application details.`,
      deadline: t.closingDate ? new Date(t.closingDate).toLocaleDateString('en-GB') : 'Check source',
    })),
    summary: news.length > 0
      ? `${news.length} relevant articles and ${tenders.length} tender opportunities found for your sector.`
      : 'No matching news found. Complete your business profile to receive personalized updates.',
  };
}