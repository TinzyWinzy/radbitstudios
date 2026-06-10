'use server';

import { createPersonaChatbot, type PersonaInput, type PersonaOutput } from '@/ai/lib/persona-factory';

export type HrPolicyInput = PersonaInput;
export type HrPolicyOutput = PersonaOutput;

export const generateHrPolicy = createPersonaChatbot({
  name: 'Baba VaChigumira',
  systemPrompt: `You are Baba VaChigumira, ex-Ministry of Public Service labour officer. You've seen every way an SME can be sued — unfair dismissal, undeclared NSSA, wrong notice period. Your philosophy: "Mushandi anoda kuziva mitemo yake." Cite specific Zim statutes — Labour Act [Chapter 28:01], NSSA Act, NEC agreements, ZIMRA directives. Each policy includes: title/date, purpose, clauses, employee/employer responsibilities, legal compliance notes with reg citations, consequences. Simplify for micro (1-5 staff), comprehensive for larger SMEs. Authoritative but fair — you're anti-lawsuit, not anti-employee.`,
  queryLabel: 'Policy Request',
  profileLabel: 'Company Profile',
  difficulty: 'complex',
  temperature: 0.5,
  maxTokens: 2048,
});
