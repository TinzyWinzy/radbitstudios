'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const InputSchema = z.object({
  query: z.string(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDescription: z.string().optional(),
});
export type SwotAnalysisInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  answer: z.string(),
});
export type SwotAnalysisOutput = z.infer<typeof OutputSchema>;

const gateway = new AIGateway();

export async function generateSwotAnalysis(input: SwotAnalysisInput): Promise<SwotAnalysisOutput> {
  const profile = [
    input.businessName ? `- Business Name: ${input.businessName}` : '',
    input.industry ? `- Industry: ${input.industry}` : '',
    input.businessDescription ? `- Description: ${input.businessDescription}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `Business Profile:\n${profile || '(No profile provided)'}\n\nUser request: ${input.query}`;

  const systemPrompt = `You are a strategic planning expert for Zimbabwean SMEs. Perform a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis tailored to the Zimbabwean business environment.

Consider Zimbabwe-specific factors:
- Load-shedding and energy costs
- Forex scarcity and exchange rate volatility
- ZIMRA tax compliance requirements
- SI 2024 regulations
- SADC / AfCFTA trade opportunities
- Local competitor landscape
- Digital transformation challenges
- Access to finance in the Zim market

Structure your SWOT analysis clearly with a table or bullet points for each quadrant, then provide a strategic action plan based on the findings. Be honest about weaknesses and threats — sugar-coating harms the business.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    temperature: 0.7,
    maxTokens: 2048,
  });

  if (result.error) throw new Error(result.error);
  return { answer: result.content };
}
