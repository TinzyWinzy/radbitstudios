'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const GenerateBusinessInsightInputSchema = z.object({
  businessDescription: z.string(),
  insightType: z.enum(['profile_generator', 'slogan_generator', 'financial_projector', 'competitor_analyzer']),
  businessName: z.string().optional(),
  industry: z.string().optional(),
});
export type GenerateBusinessInsightInput = z.infer<typeof GenerateBusinessInsightInputSchema>;

const GenerateBusinessInsightOutputSchema = z.object({
  insight: z.string(),
});
export type GenerateBusinessInsightOutput = z.infer<typeof GenerateBusinessInsightOutputSchema>;

const gateway = new AIGateway();

const SYSTEM_PROMPTS: Record<string, string> = {
  profile_generator: 'Write a professional and compelling one-paragraph company profile for a Zimbabwean SME.',
  slogan_generator: 'Generate a list of 5 catchy and memorable slogans for a Zimbabwean business. Mix Shona/English and English-only options. Keep under 8 words each.',
  financial_projector: 'Create a simple 12-month revenue and expense projection in a markdown table. Include columns for Month, Revenue, Expenses, and Profit. Use realistic Zimbabwean numbers.',
  competitor_analyzer: 'Identify 2-3 likely competitor types in the Zimbabwean market. For each, provide a brief analysis of their likely strengths and weaknesses. Format as structured markdown with a comparison table.',
};

export async function generateBusinessInsight(input: GenerateBusinessInsightInput): Promise<GenerateBusinessInsightOutput> {
  const profile = `Business Name: ${input.businessName || 'N/A'}\nIndustry: ${input.industry || 'N/A'}\nDescription: ${input.businessDescription}`;

  const prompt = `### Business Profile:\n${profile}\n\n### Generate: ${input.insightType}\n\nOutput only the generated content in clear markdown, without introductory phrases.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt: SYSTEM_PROMPTS[input.insightType] || '',
    difficulty: 'complex',
    maxTokens: 1536,
  });

  return { insight: result.content };
}
