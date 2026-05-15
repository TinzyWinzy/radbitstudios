
'use server';

/**
 * @fileOverview Implements an AI business mentor chatbot flow.
 *
 * - aiBusinessMentor - A function that provides business advice and answers user questions.
 * - AiBusinessMentorInput - The input type for the aiBusinessMentor function.
 * - AiBusinessMentorOutput - The return type for the aiBusinessMentor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiBusinessMentorInputSchema = z.object({
  query: z.string().describe('The user question about business.'),
  businessName: z.string().optional().describe("The user's business name."),
  industry: z.string().optional().describe("The user's industry."),
  businessDescription: z.string().optional().describe("The user's business description."),
});
export type AiBusinessMentorInput = z.infer<typeof AiBusinessMentorInputSchema>;

const AiBusinessMentorOutputSchema = z.object({
  answer: z.string().describe('The AI business mentor answer to the user question.'),
});
export type AiBusinessMentorOutput = z.infer<typeof AiBusinessMentorOutputSchema>;

export async function aiBusinessMentor(input: AiBusinessMentorInput): Promise<AiBusinessMentorOutput> {
  return aiBusinessMentorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiBusinessMentorPrompt',
  input: {schema: AiBusinessMentorInputSchema},
  output: {schema: AiBusinessMentorOutputSchema},
  prompt: `You are an AI business mentor for Zimbabwean SMEs. Your goal is to provide supportive, actionable, and context-aware advice.

  Here is the user's business profile:
  {{#if businessName}}
  - Business Name: {{{businessName}}}
  {{/if}}
  {{#if industry}}
  - Industry: {{{industry}}}
  {{/if}}
  {{#if businessDescription}}
  - Description: {{{businessDescription}}}
  {{/if}}

  Based on their profile and their question, provide a helpful and encouraging answer. Address the user's specific context and provide clear, actionable steps or insights they can use for their business in Zimbabwe.

  User question: {{{query}}}
  `,
});

const aiBusinessMentorFlow = ai.defineFlow(
  {
    name: 'aiBusinessMentorFlow',
    inputSchema: AiBusinessMentorInputSchema,
    outputSchema: AiBusinessMentorOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output ?? {answer: 'Unable to generate a response. Please try again.'};
    } catch (error) {
      console.error('[aiBusinessMentorFlow] Error:', error);
      throw new Error(
        `AI mentor failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
);
