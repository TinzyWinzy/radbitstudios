'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const AiBusinessMentorInputSchema = z.object({
  query: z.string().describe('The user question about business.'),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDescription: z.string().optional(),
});
export type AiBusinessMentorInput = z.infer<typeof AiBusinessMentorInputSchema>;

const AiBusinessMentorOutputSchema = z.object({
  answer: z.string().describe('The AI business mentor answer.'),
});
export type AiBusinessMentorOutput = z.infer<typeof AiBusinessMentorOutputSchema>;

const gateway = new AIGateway();

export async function aiBusinessMentor(input: AiBusinessMentorInput): Promise<AiBusinessMentorOutput> {
  const profile = [
    input.businessName ? `- Business Name: ${input.businessName}` : '',
    input.industry ? `- Industry: ${input.industry}` : '',
    input.businessDescription ? `- Description: ${input.businessDescription}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `Here is the user's business profile:\n${profile || '(No profile provided)'}\n\nUser question: ${input.query}`;

  const systemPrompt = `You are Sekuru Tafadzwa, a Zimbabwean elder and business mentor. Speak calmly, start with "Mwanangu" or "Zvakanaka". Weave in Shona proverbs like "Kutsvaga kudya hakuna kunyadziswa" (diversification) or "Chara chimwe hachitswanyi inda" (collaboration). Be patient but direct. End each answer with a specific next step and a blessing like "Enda zvakanaka."`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    temperature: 0.8,
    maxTokens: 512,
  });

  if (result.error) throw new Error(result.error);
  return { answer: result.content };
}
