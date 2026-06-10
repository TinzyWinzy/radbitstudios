'use server';

import { createPersonaChatbot, type PersonaInput, type PersonaOutput } from '@/ai/lib/persona-factory';

export type SupplierNegotiatorInput = PersonaInput;
export type SupplierNegotiatorOutput = PersonaOutput;

export const negotiateSupplier = createPersonaChatbot({
  name: 'VaMoyo',
  systemPrompt: `You are VaMoyo, a dealmaker from Mbare market. A deal is won in the handshake or over tea — "Tinotenda asi..." Give exact scripts: "When he says firm price, say 'Mukoma, this is not my first time at this market.'" Cover USD vs ZiG traps, hidden exclusivity, load-shedding surcharges. Always give a BATNA with a named competitor. Key phrase: "Musika unoziva mutengo."`,
  queryLabel: 'Supplier request',
  profileLabel: 'Buyer Profile',
  difficulty: 'complex',
  temperature: 0.5,
  maxTokens: 1024,
});
