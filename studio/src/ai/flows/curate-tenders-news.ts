
'use server';

/**
 * @fileOverview Curates relevant tenders and news articles from user-provided text content using AI.
 *
 * - curateTendersNews - A function that analyzes text and filters it for relevance.
 * - CurateTendersNewsInput - The input type for the curateTendersNews function.
 * - CurateTendersNewsOutput - The return type for the curateTendersNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CurateTendersNewsInputSchema = z.object({
  content: z.string().describe('A block of text containing one or more articles to be analyzed and curated.'),
  userQuery: z.string().describe('A query describing the user\'s business or interests, used to determine relevance.'),
});

export type CurateTendersNewsInput = z.infer<typeof CurateTendersNewsInputSchema>;

const ArticleSchema = z.object({
  title: z.string().describe('The title of the tender or news article.'),
  summary: z.string().describe('A concise summary of the article.'),
  source: z.string().url().describe('The original URL of the article, if available in the text.'),
  category: z.string().describe("A relevant category for the article (e.g., 'Tender', 'News', 'Policy Update')."),
  isRelevant: z.boolean().describe('Whether the article is relevant to the user\'s query.'),
  expiryDate: z.string().optional().describe('The deadline or expiry date for a tender, if available (YYYY-MM-DD).')
});

const CurateTendersNewsOutputSchema = z.object({
  articles: z.array(ArticleSchema).describe('The curated list of structured articles that were deemed relevant.'),
});

export type CurateTendersNewsOutput = z.infer<typeof CurateTendersNewsOutputSchema>;

export async function curateTendersNews(input: CurateTendersNewsInput): Promise<CurateTendersNewsOutput> {
  return curateTendersNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'curateTendersNewsPrompt',
  input: {schema: CurateTendersNewsInputSchema},
  output: {schema: CurateTendersNewsOutputSchema},
  prompt: `You are an AI assistant that analyzes a block of text and curates it for a user.

  User's Interest: {{{userQuery}}}

  Analyze the text content provided below. The text may contain one or more articles. For each distinct article you can identify:
  1. Extract the article title, a concise summary, the source URL (if present), and the category ('Tender', 'News', or 'Policy Update').
  2. If it is a tender, extract the expiry date if available.
  3. Determine if the article is relevant to the user's stated interest.
  4. Construct a list of article objects. Only include articles in the final output array that you determine to be relevant.

  Content to analyze:
  {{{content}}}
  `,
});

const curateTendersNewsFlow = ai.defineFlow(
  {
    name: 'curateTendersNewsFlow',
    inputSchema: CurateTendersNewsInputSchema,
    outputSchema: CurateTendersNewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure we always return a valid object, even if the AI fails or finds no relevant articles.
    return output ?? { articles: [] };
  }
);

    