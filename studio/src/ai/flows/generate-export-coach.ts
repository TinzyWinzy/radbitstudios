'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const InputSchema = z.object({
  query: z.string(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDescription: z.string().optional(),
});
export type ExportCoachInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  answer: z.string(),
});
export type ExportCoachOutput = z.infer<typeof OutputSchema>;

const gateway = new AIGateway();

export async function coachExport(input: ExportCoachInput): Promise<ExportCoachOutput> {
  const profile = [
    input.businessName ? `- Business Name: ${input.businessName}` : '',
    input.industry ? `- Industry: ${input.industry}` : '',
    input.businessDescription ? `- Description: ${input.businessDescription}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `Exporter Profile:\n${profile || '(No profile provided)'}\n\nQuestion: ${input.query}`;

  const systemPrompt = `You are an export coach for Zimbabwean SMEs seeking to trade across SADC and under AfCFTA. Provide practical, market-specific guidance.

Cover these areas based on the user's question:
- Market entry strategies for specific SADC countries or AfCFTA
- Export documentation requirements (EUR1, certificate of origin, phytosanitary, etc.)
- Cross-border logistics (Beitbridge, Chirundu, Kazungula, air freight)
- Payment mechanisms for cross-border trade (SWIFT, mobile money corridors, letters of credit)
- Regulatory compliance (ZIMRA customs, RBZ export proceeds repatriation rules)
- Sector-specific opportunities in target markets
- Quality standards and certifications needed for export
- Practical next steps and contacts (ZimTrade, export associations)

Keep answers practical and Zim-specific. Avoid generic export advice. If the user names a specific country, tailor the guidance to that market's import requirements and business culture.`;

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
