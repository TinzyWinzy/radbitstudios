
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating business insights using AI-powered tools.
 *
 * It includes:
 * - generateBusinessInsight - A function that orchestrates the generation of business insights.
 * - GenerateBusinessInsightInput - The input type for the generateBusinessInsight function.
 * - GenerateBusinessInsightOutput - The return type for the generateBusinessInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBusinessInsightInputSchema = z.object({
  businessDescription: z.string().describe('A detailed description of the user’s business.'),
  insightType: z
    .enum([
      'profile_generator',
      'slogan_generator',
      'financial_projector',
      'competitor_analyzer',
    ])
    .describe(
      'The type of business insight to generate. Valid values are profile_generator, slogan_generator, financial_projector, and competitor_analyzer.'
    ),
  businessName: z.string().optional().describe("The user's business name."),
  industry: z.string().optional().describe("The user's industry."),
});
export type GenerateBusinessInsightInput = z.infer<
  typeof GenerateBusinessInsightInputSchema
>;

const GenerateBusinessInsightOutputSchema = z.object({
  insight: z.string().describe('The generated business insight.'),
});
export type GenerateBusinessInsightOutput = z.infer<
  typeof GenerateBusinessInsightOutputSchema
>;

export async function generateBusinessInsight(
  input: GenerateBusinessInsightInput
): Promise<GenerateBusinessInsightOutput> {
  return generateBusinessInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBusinessInsightPrompt',
  input: {schema: GenerateBusinessInsightInputSchema},
  output: {schema: GenerateBusinessInsightOutputSchema},
  prompt: `You are an AI-powered business toolkit for Zimbabwean SMEs. Your task is to generate a specific business asset based on the user's profile and the requested insight type.

### Business Profile:
{{#if businessName}}
- **Business Name:** {{{businessName}}}
{{/if}}
{{#if industry}}
- **Industry:** {{{industry}}}
{{/if}}
- **Description:** {{{businessDescription}}}

---

### Insight to Generate: {{{insightType}}}

**Instructions:**
- **If insightType is 'profile_generator':** Write a professional and compelling one-paragraph company profile.
- **If insightType is 'slogan_generator':** Generate a list of 5 catchy and memorable slogans.
- **If insightType is 'financial_projector':** Create a simple 12-month revenue and expense projection in a markdown table format. Include columns for Month, Revenue, Expenses, and Profit. Assume realistic numbers for a small business in Zimbabwe.
- **If insightType is 'competitor_analyzer':** Based on the business description, identify 2-3 likely competitor types in the Zimbabwean market. For each, provide a brief analysis of their likely strengths and weaknesses.

The output should be the generated text only, formatted in clear markdown, without any introductory phrases.
`,
});

const generateBusinessInsightFlow = ai.defineFlow(
  {
    name: 'generateBusinessInsightFlow',
    inputSchema: GenerateBusinessInsightInputSchema,
    outputSchema: GenerateBusinessInsightOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output ?? {insight: 'Unable to generate insight. Please try again.'};
    } catch (error) {
      console.error('[generateBusinessInsightFlow] Error:', error);
      throw new Error(
        `Business insight generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
);
