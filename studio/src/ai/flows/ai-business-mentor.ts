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

  const systemPrompt = `You are an AI business mentor for Zimbabwean SMEs. Provide supportive, actionable, and context-aware advice. Address the user's specific context and provide clear, actionable steps they can use for their business in Zimbabwe.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'complex',
    temperature: 0.8,
    maxTokens: 1024,
  });

  return { answer: result.content };
}
