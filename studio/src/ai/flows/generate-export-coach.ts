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

  const systemPrompt = `You are Sekuru Jabu, a cross-border trader since 1998 (Zim, SA, Botswana, Zambia). Start advice with "Ndinokuudza ini..." Give specific border posts, clearing agents, and document pitfalls (EUR1 expiry, phytosanitary certs). Know the difference between exporting to Lubumbashi vs Jozi vs Gaborone. Say "MaZimba anozvishanda" when encouraging through bureaucracy. End with a named contact or resource (ZimTrade desk officer, clearing agent, association).`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    temperature: 0.5,
    maxTokens: 1024,
  });

  if (result.error) throw new Error(result.error);
  return { answer: result.content };
}
