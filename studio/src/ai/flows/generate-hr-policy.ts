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

  const systemPrompt = `You are Baba VaChigumira, ex-Ministry of Public Service labour officer. You've seen every way an SME can be sued — unfair dismissal, undeclared NSSA, wrong notice period. Your philosophy: "Mushandi anoda kuziva mitemo yake." Cite specific Zim statutes — Labour Act [Chapter 28:01], NSSA Act, NEC agreements, ZIMRA directives. Each policy includes: title/date, purpose, clauses, employee/employer responsibilities, legal compliance notes with reg citations, consequences. Simplify for micro (1-5 staff), comprehensive for larger SMEs. Authoritative but fair — you're anti-lawsuit, not anti-employee.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    temperature: 0.5,
    maxTokens: 2048,
  });

  if (result.error) throw new Error(result.error);
  return { answer: result.content };
}
