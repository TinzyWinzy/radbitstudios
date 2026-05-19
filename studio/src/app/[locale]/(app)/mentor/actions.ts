'use server';

import { aiBusinessMentor, AiBusinessMentorInput } from '@/ai/flows/ai-business-mentor';
import { getNewsForUser } from '@/services/news-scraper';
import { getTendersForUser } from '@/services/tender-scraper';

export async function sendMessageAction(
  input: Omit<AiBusinessMentorInput, 'userId'> & { userId?: string }
): Promise<{ answer: string }> {

  if (!input.query?.trim()) {
    throw new Error('Message is empty.');
  }

  try {
    let newsContext = '';
    let tenderContext = '';

    if (input.userId) {
      const news = await getNewsForUser(input.userId);
      const tenders = await getTendersForUser(input.userId);

      if (news.length > 0) {
        newsContext = `\n\nCURRENT BUSINESS NEWS FOR YOUR INDUSTRY:\n` +
          news.slice(0, 5).map((n, i) =>
            `${i + 1}. [${n.sourceName}] ${n.title} — ${n.summary.slice(0, 200)}`
          ).join('\n');
      }

      if (tenders.length > 0) {
        const relevantTenders = tenders.filter(t => t.status !== 'closed').slice(0, 5);
        tenderContext = `\n\nRELEVANT TENDER OPPORTUNITIES:\n` +
          relevantTenders.map((t, i) =>
            `${i + 1}. ${t.title} (${t.organization}) — ${t.sector}. ${t.value ? `Value: ${t.value}` : ''} Closes: ${t.closingDate ? new Date(t.closingDate).toLocaleDateString('en-GB') : 'See source'}`
          ).join('\n');
      }
    }

    const response = await aiBusinessMentor({
      query: input.query + (newsContext || tenderContext ? `\n\n[FYI — Context from Radbit data: ${newsContext || ''}${tenderContext || ''}]` : ''),
      businessName: input.businessName,
      industry: input.industry,
      businessDescription: input.businessDescription,
    });

    return { answer: response.answer };

  } catch (error: any) {
    console.error('Error in sendMessageAction:', error);
    throw new Error(error.message || 'Sorry, the AI mentor encountered an error. Please try again.');
  }
}

export async function sendMessageWithNews(
  input: {
    query: string;
    businessName?: string;
    industry?: string;
    businessDescription?: string;
    userId: string;
  }
): Promise<{ answer: string; newsCount: number; tenderCount: number }> {
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

  const enrichedQuery = input.query + (newsCtx || tenderCtx ? `\n\n[Context: ${newsCtx}${tenderCtx}]` : '');

  const response = await aiBusinessMentor({
    query: enrichedQuery,
    businessName: input.businessName,
    industry: input.industry,
    businessDescription: input.businessDescription,
  });

  return {
    answer: response.answer,
    newsCount: news.length,
    tenderCount: tenders.filter(t => t.status !== 'closed').length,
  };
}