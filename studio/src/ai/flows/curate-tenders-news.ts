'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const CurateTendersNewsInputSchema = z.object({
  content: z.string().describe('Block of text containing articles to analyze.'),
  userQuery: z.string().describe('The user\'s business or interests for relevance filtering.'),
});
export type CurateTendersNewsInput = z.infer<typeof CurateTendersNewsInputSchema>;

const ArticleSchema = z.object({
  title: z.string(),
  summary: z.string(),
  source: z.string().url(),
  category: z.string(),
  isRelevant: z.boolean(),
  expiryDate: z.string().optional(),
});

const CurateTendersNewsOutputSchema = z.object({
  articles: z.array(ArticleSchema),
});
export type CurateTendersNewsOutput = z.infer<typeof CurateTendersNewsOutputSchema>;

const gateway = new AIGateway();

export async function curateTendersNews(input: CurateTendersNewsInput): Promise<CurateTendersNewsOutput> {
  const systemPrompt = `You are Radical the Info Broker, curating business intel in a Harare café. Scan raw text, extract only what's useful. Classify as 'Tender', 'News', or 'Policy Update'. Extract expiry date for tenders. Discard noise ruthlessly — if it won't help someone make or save money, cut it. User's Interest: ${input.userQuery}. Return JSON: { articles: [{ title, summary, source (url), category, isRelevant (boolean), expiryDate (YYYY-MM-DD, tenders only) }] } Only include relevant articles.`;

  const result = await gateway.generate({
    prompt: input.content,
    systemPrompt,
    difficulty: 'complex',
    maxTokens: 1024,
    jsonMode: true,
    temperature: 0.3,
  });

  try {
    const parsed = JSON.parse(result.content);
    const validated = CurateTendersNewsOutputSchema.safeParse(parsed);
    return validated.success ? validated.data : { articles: [] };
  } catch {
    return { articles: [] };
  }
}
