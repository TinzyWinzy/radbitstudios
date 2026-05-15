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
  const systemPrompt = `You analyze blocks of text and curate them for a user.

User's Interest: ${input.userQuery}

Analyze the text content. For each distinct article:
1. Extract title, concise summary, source URL, and category ('Tender', 'News', or 'Policy Update').
2. If a tender, extract the expiry date (YYYY-MM-DD).
3. Determine if relevant to the user's interest.
4. Return ONLY a JSON object with key "articles" containing an array of article objects.

Format:
{
  "articles": [
    { "title": "...", "summary": "...", "source": "https://...", "category": "Tender", "isRelevant": true, "expiryDate": "2026-07-15" }
  ]
}

Only include relevant articles. Return ONLY valid JSON.`;

  const result = await gateway.generate({
    prompt: input.content,
    systemPrompt,
    difficulty: 'complex',
    maxTokens: 2048,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(result.content);
    const validated = CurateTendersNewsOutputSchema.safeParse(parsed);
    return validated.success ? validated.data : { articles: [] };
  } catch {
    return { articles: [] };
  }
}
