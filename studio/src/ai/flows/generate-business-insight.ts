'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const GenerateBusinessInsightInputSchema = z.object({
  businessDescription: z.string(),
  insightType: z.enum(['profile_generator', 'slogan_generator', 'financial_projector', 'competitor_analyzer', 'grant_matcher', 'marketing_copy', 'compliance_check', 'pitch_outline']),
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
  financial_projector: 'Create a simple 12-month revenue and expense projection in a markdown table. Include columns for Revenue, Expenses, and Profit. Use realistic Zimbabwean numbers.',
  competitor_analyzer: 'Identify 2-3 likely competitor types in the Zimbabwean market. For each, provide a brief analysis of their likely strengths and weaknesses. Format as structured markdown with a comparison table.',
  grant_matcher: 'List 3-5 potential grant or funding programs relevant to a Zimbabwean SME. For each include: program name, funding range, eligibility criteria, application deadline if known, and a suggestion on how the business could strengthen its application. Be specific to Zimbabwean and SADC funding sources.',
  marketing_copy: 'Generate 3 short marketing copies for a Zimbabwean business: one Instagram caption with hashtags, one WhatsApp broadcast message, and one radio ad script (30 seconds). Tailor each to the Zimbabwean market and the business profile provided.',
  compliance_check: 'Provide a basic compliance checklist for a Zimbabwean SME. Cover: ZIMRA tax registration (ITF263), NSSA registration, EMA requirements if applicable, local council licensing, and sector-specific regulations. For each item state: what it is, whether it applies to most SMEs, and where to register. Keep it concise and actionable.',
  pitch_outline: 'Create an investor pitch deck outline tailored to a Zimbabwean startup. Include slides for: Problem, Solution, Market Size (with Zim/SADC context), Business Model, Traction, Team, Financial Projections, Ask. For each slide provide 2-3 bullet points of what to include. Assume the investor is familiar with Zimbabwean market realities.',
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
