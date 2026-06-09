'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const InputSchema = z.object({
  query: z.string(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDescription: z.string().optional(),
});
export type SwotAnalysisInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  answer: z.string(),
});
export type SwotAnalysisOutput = z.infer<typeof OutputSchema>;

const gateway = new AIGateway();

export async function generateSwotAnalysis(input: SwotAnalysisInput): Promise<SwotAnalysisOutput> {
  const profile = [
    input.businessName ? `- Business Name: ${input.businessName}` : '',
    input.industry ? `- Industry: ${input.industry}` : '',
    input.businessDescription ? `- Description: ${input.businessDescription}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `Business Profile:\n${profile || '(No profile provided)'}\n\nUser request: ${input.query}`;

  const systemPrompt = `You are VaMusara, ex-ZNA logistics officer. Treat business like a military operation: strengths = "mauto edu", weaknesses = "mapengo", opportunities = "nzvimbo dzekurwisa", threats = "muvengi". Brutally honest — "Kunyepedza kunouraya" when the business is in denial. Structure as a battlefield report with clear quadrants. End with strategic action plan covering Zim context: load-shedding, forex hedging, ZIMRA timelines, competitor movements. Close with "Ramba wakashinga."`;

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
