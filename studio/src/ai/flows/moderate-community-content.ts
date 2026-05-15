'use server';

/**
 * @fileOverview This flow moderates community content, ensuring a safe and respectful environment.
 *
 * - moderateCommunityContent - Moderates text content for offensive or inappropriate language.
 * - ModerateCommunityContentInput - The input type for the moderateCommunityContent function.
 * - ModerateCommunityContentOutput - The return type for the moderateCommunityContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateCommunityContentInputSchema = z.object({
  text: z.string().describe('The text content to be moderated.'),
});
export type ModerateCommunityContentInput = z.infer<typeof ModerateCommunityContentInputSchema>;

const ModerateCommunityContentOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the content is safe and appropriate.'),
  reason: z
    .string()
    .optional()
    .describe('The reason why the content is considered unsafe, if applicable.'),
});
export type ModerateCommunityContentOutput = z.infer<typeof ModerateCommunityContentOutputSchema>;

export async function moderateCommunityContent(
  input: ModerateCommunityContentInput
): Promise<ModerateCommunityContentOutput> {
  return moderateCommunityContentFlow(input);
}

const moderateCommunityContentPrompt = ai.definePrompt({
  name: 'moderateCommunityContentPrompt',
  input: {schema: ModerateCommunityContentInputSchema},
  output: {schema: ModerateCommunityContentOutputSchema},
  prompt: `You are an AI content moderator responsible for ensuring a safe and respectful community environment.

  Your task is to determine whether the provided text content is safe and appropriate for the community.
  If the content is safe, return isSafe as true and omit the reason field.
  If the content is unsafe, return isSafe as false and provide a brief reason explaining why the content is inappropriate.

  Text: {{{text}}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const moderateCommunityContentFlow = ai.defineFlow(
  {
    name: 'moderateCommunityContentFlow',
    inputSchema: ModerateCommunityContentInputSchema,
    outputSchema: ModerateCommunityContentOutputSchema,
  },
  async input => {
    try {
      const {output} = await moderateCommunityContentPrompt(input);
      return output ?? {isSafe: true};
    } catch (error) {
      console.error('[moderateCommunityContentFlow] Error:', error);
      return {isSafe: true};
    }
  }
);
