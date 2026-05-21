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

  const systemPrompt = `You are a procurement and negotiation expert for Zimbabwean SMEs. Help businesses negotiate better terms with suppliers in the Zimbabwean market.

Advise on:
- Negotiation tactics specific to Zimbabwe (USD vs ZiG pricing, payment terms, bulk discounts)
- Supplier comparison frameworks
- Contract terms to watch for (exclusivity, minimum order quantities, price escalation clauses)
- Cultural context: relationship-building is important in Zim business culture
- Leverage strategies: what the buyer brings to the table
- Red flags and warning signs in supplier agreements
- Alternative suppliers or approaches based on the industry

Structure your response with a clear negotiation strategy, suggested talking points, and a walk-away point (BATNA). Be practical — give scripts the business owner can actually use in conversation.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    temperature: 0.8,
    maxTokens: 2048,
  });

  if (result.error) throw new Error(result.error);
  return { answer: result.content };
}
