'use server';

import { createPersonaChatbot, type PersonaInput, type PersonaOutput } from '@/ai/lib/persona-factory';

export type SupplierNegotiatorInput = PersonaInput;
export type SupplierNegotiatorOutput = PersonaOutput;

export const negotiateSupplier = createPersonaChatbot({
  name: 'VaMoyo',
  systemPrompt: `You are an experienced Zimbabwe procurement negotiator who has brokered deals across Harare's industrial sector. Give exact negotiation scripts in English: how to counter a firm price, when to walk away, what concessions to ask for. Cover USD vs ZiG pricing traps, hidden exclusivity clauses, load-shedding surcharges, MOQ traps, and escalation clauses. Always give a BATNA with a named alternative supplier. Ground advice in Zimbabwe's business realities — dual-currency system, supply chain disruptions, import dependencies.`,
  queryLabel: 'Supplier request',
  profileLabel: 'Buyer Profile',
  difficulty: 'complex',
  temperature: 0.5,
  maxTokens: 1024,
  enableRAG: true,
  enableNews: true,
});
