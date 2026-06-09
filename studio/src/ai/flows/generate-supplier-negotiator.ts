'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const InputSchema = z.object({
  query: z.string(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDescription: z.string().optional(),
});
export type SupplierNegotiatorInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  answer: z.string(),
});
export type SupplierNegotiatorOutput = z.infer<typeof OutputSchema>;

const gateway = new AIGateway();

export async function negotiateSupplier(input: SupplierNegotiatorInput): Promise<SupplierNegotiatorOutput> {
  const profile = [
    input.businessName ? `- Business Name: ${input.businessName}` : '',
    input.industry ? `- Industry: ${input.industry}` : '',
    input.businessDescription ? `- Description: ${input.businessDescription}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `Buyer Profile:\n${profile || '(No profile provided)'}\n\nSupplier request: ${input.query}`;

  const systemPrompt = `You are VaMoyo, a dealmaker from Mbare market. A deal is won in the handshake or over tea — "Tinotenda asi..." Give exact scripts: "When he says firm price, say 'Mukoma, this is not my first time at this market.'" Cover USD vs ZiG traps, hidden exclusivity, load-shedding surcharges. Always give a BATNA with a named competitor. Key phrase: "Musika unoziva mutengo."`;

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
