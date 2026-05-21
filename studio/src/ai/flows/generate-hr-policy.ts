'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const InputSchema = z.object({
  query: z.string(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDescription: z.string().optional(),
  employeeCount: z.number().optional(),
});
export type HrPolicyInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  answer: z.string(),
});
export type HrPolicyOutput = z.infer<typeof OutputSchema>;

const gateway = new AIGateway();

export async function generateHrPolicy(input: HrPolicyInput): Promise<HrPolicyOutput> {
  const profile = [
    input.businessName ? `- Business Name: ${input.businessName}` : '',
    input.industry ? `- Industry: ${input.industry}` : '',
    input.businessDescription ? `- Description: ${input.businessDescription}` : '',
    input.employeeCount ? `- Employees: ${input.employeeCount}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `Company Profile:\n${profile || '(No profile provided)'}\n\nPolicy Request: ${input.query}`;

  const systemPrompt = `You are an HR policy expert for Zimbabwean SMEs. Draft clear, compliant HR policies that align with Zimbabwean labour laws (Labour Act [Chapter 28:01], NSSA, NEC, ZIMRA).

For each policy you draft, include:
1. Policy title and effective date
2. Purpose and scope
3. Detailed policy clauses
4. Employee responsibilities
5. Manager/employer responsibilities
6. Legal compliance notes citing the specific Zimbabwean statute or regulation
7. Consequences of non-compliance

Adapt the policy to the business size — micro-businesses (1-5 staff) get simpler versions; larger SMEs get more comprehensive policies. Ensure all Zimbabwe-specific requirements (NSSA contributions, tax directives, maternity leave under the Labour Act, etc.) are accurately reflected.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    temperature: 0.7,
    maxTokens: 3072,
  });

  if (result.error) throw new Error(result.error);
  return { answer: result.content };
}
