
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a summary and recommendations
 * based on a user's digital readiness assessment responses.
 *
 * It includes:
 * - generateAssessmentSummary - A function that analyzes assessment data and provides an AI summary.
 * - GenerateAssessmentSummaryInput - The input type for the function.
 * - GenerateAssessmentSummaryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessmentResponseSchema = z.object({
    question: z.string(),
    answer: z.string(),
    score: z.number().describe('A score from 1 (lowest) to 4 (highest) based on the user\'s answer.'),
    category: z.string().describe('The category of the question (e.g., Finance, Marketing).'),
});

const GenerateAssessmentSummaryInputSchema = z.object({
  responses: z.array(AssessmentResponseSchema).describe('An array of the user\'s responses to the assessment questions.'),
});
export type GenerateAssessmentSummaryInput = z.infer<typeof GenerateAssessmentSummaryInputSchema>;

const GenerateAssessmentSummaryOutputSchema = z.object({
  summary: z.string().describe('A personalized summary identifying the user\'s strongest and weakest areas, with actionable recommendations.'),
});
export type GenerateAssessmentSummaryOutput = z.infer<typeof GenerateAssessmentSummaryOutputSchema>;

export async function generateAssessmentSummary(
  input: GenerateAssessmentSummaryInput
): Promise<GenerateAssessmentSummaryOutput> {
  return generateAssessmentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssessmentSummaryPrompt',
  input: {schema: GenerateAssessmentSummaryInputSchema},
  output: {schema: GenerateAssessmentSummaryOutputSchema},
  prompt: `You are an expert business consultant for Zimbabwean SMEs. Analyze the following digital readiness assessment responses.

The user's answers are provided below. Each answer has a score from 1 (digitally basic) to 4 (digitally advanced).

Assessment Data:
{{#each responses}}
- Category: {{category}}
  Question: {{question}}
  Answer: "{{answer}}" (Score: {{score}})
{{/each}}

Based on this data, provide a concise, insightful summary for the user.
1.  Start by clearly identifying their single strongest area (highest average score).
2.  Then, clearly identify their single weakest area (lowest average score).
3.  Provide 2-3 actionable, simple, and specific recommendations tailored to a Zimbabwean context to help them improve their weakest area. Phrase these as direct advice. For example, "Consider using Paynow for online payments," not "You could consider..."
4.  Keep the entire summary under 100 words. Be encouraging and straight to the point.
`,
});

const generateAssessmentSummaryFlow = ai.defineFlow(
  {
    name: 'generateAssessmentSummaryFlow',
    inputSchema: GenerateAssessmentSummaryInputSchema,
    outputSchema: GenerateAssessmentSummaryOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output ?? {summary: 'Unable to generate summary. Please try again.'};
    } catch (error) {
      console.error('[generateAssessmentSummaryFlow] Error:', error);
      throw new Error(
        `Assessment summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
);
