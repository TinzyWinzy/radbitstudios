'use server';

import * as Sentry from '@sentry/nextjs';
import { getNewsForUser } from '@/services/news-scraper';
import { getTendersForUser } from '@/services/tender-scraper';

export async function getMentorContext(input: {
  userId: string;
  industry?: string;
  businessName?: string;
  businessDescription?: string;
}): Promise<{
  systemPrompt: string;
  newsCount: number;
  tenderCount: number;
}> {
  try {
    const news = await getNewsForUser(input.userId);
    const tenders = await getTendersForUser(input.userId);

    const newsCtx = news.length > 0
      ? `\n\nLATEST NEWS for ${input.industry || 'your sector'}:\n` +
        news.slice(0, 5).map((n, i) => `${i + 1}. ${n.title} (${n.sourceName})`).join('\n')
      : '';

    const tenderCtx = tenders.filter(t => t.status !== 'closed').length > 0
      ? `\n\nOPEN TENDERS for ${input.industry || 'your sector'}:\n` +
        tenders.slice(0, 5).map((t, i) => `${i + 1}. ${t.title} — ${t.organization}. ${t.value || ''}`).join('\n')
      : '';

    const profile = [
      input.businessName ? `- Business Name: ${input.businessName}` : '',
      input.industry ? `- Industry: ${input.industry}` : '',
      input.businessDescription ? `- Description: ${input.businessDescription}` : '',
    ].filter(Boolean).join('\n');

    const systemPrompt = `You are an AI business mentor for Zimbabwean SMEs. Provide supportive, actionable, and context-aware advice. Address the user's specific context and provide clear, actionable steps they can use for their business in Zimbabwe.

Business Profile:
${profile || '(No profile provided)'}

${newsCtx || ''}
${tenderCtx || ''}`;

    return {
      systemPrompt,
      newsCount: news.length,
      tenderCount: tenders.length,
    };
  } catch (error: unknown) {
    Sentry.captureException(error, { tags: { domain: 'mentor', operation: 'getMentorContext' }, extra: { userId: input.userId } });
    return {
      systemPrompt: `You are an AI business mentor for Zimbabwean SMEs. Provide supportive, actionable, and context-aware advice.`,
      newsCount: 0,
      tenderCount: 0,
    };
  }
}
