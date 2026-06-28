'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

const InputSchema = z.object({
  businessType: z.string(),
  description: z.string(),
  name: z.string().optional(),
  location: z.string().optional(),
});
export type GeneratePartnerPitchInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  pitch: z.string(),
  offer: z.string(),
  whatsapp: z.string(),
});
export type GeneratePartnerPitchOutput = z.infer<typeof OutputSchema>;

const SYSTEM_PROMPT = `You are Tafadzwa, a Radbit partner sales assistant.

Generate a tailored sales pitch for a Radbit partner to use when referring a prospective client.

Output three sections clearly labeled:

1. PITCH — A professional 3-paragraph pitch the partner can use in a meeting or email. Explain who Radbit is (Zimbabwe's SME digital infrastructure platform), what we offer (websites, compliance tools, AI business tools, tender intelligence), and why the prospect needs it. Keep it warm and consultative, not pushy. Reference the specific business type.

2. OFFER — A specific offer tailored to this business type. Include a rough price point (Growth $5/mo, Tender Starter $10/mo, Pro $15/mo) and what value they get. Mention Radbit's Zimbabwe-specific advantages: EcoCash payments, ZIMRA compliance, PRAZ tools, load-shedding resilient.

3. WHATSAPP — A ready-to-send WhatsApp message (under 300 characters) the partner can copy-paste. Use a friendly, personal tone. Include emojis sparingly. End with a call to action to hop on a quick call.

Write in English with occasional Shona phrases where natural. Be specific to the business type described.`;

const gateway = aiGateway;

export async function generatePartnerPitch(input: GeneratePartnerPitchInput): Promise<GeneratePartnerPitchOutput> {
  const context = [
    `Business Type: ${input.businessType}`,
    `Description: ${input.description}`,
    input.name ? `Contact Name: ${input.name}` : '',
    input.location ? `Location: ${input.location}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `### Prospect Context:\n${context}\n\nGenerate pitch, offer, and WhatsApp message for this prospect. Label each section PITCH:, OFFER:, WHATSAPP:.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt: SYSTEM_PROMPT,
    difficulty: 'complex',
    maxTokens: 2048,
  });

  const text = result.content || '';

  const pitchMatch = text.match(/PITCH:([\s\S]*?)(?=OFFER:|$)/);
  const offerMatch = text.match(/OFFER:([\s\S]*?)(?=WHATSAPP:|$)/);
  const whatsappMatch = text.match(/WHATSAPP:([\s\S]*)$/);

  return {
    pitch: (pitchMatch?.[1] || text).trim(),
    offer: (offerMatch?.[1] || '').trim(),
    whatsapp: (whatsappMatch?.[1] || '').trim(),
  };
}
