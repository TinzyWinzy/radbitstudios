'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const AssessmentResponseSchema = z.object({
  question: z.string(),
  answer: z.string(),
  score: z.number().describe('Score from 1 (lowest) to 4 (highest)'),
  category: z.string(),
});

const GenerateAssessmentSummaryInputSchema = z.object({
  responses: z.array(AssessmentResponseSchema),
});
export type GenerateAssessmentSummaryInput = z.infer<typeof GenerateAssessmentSummaryInputSchema>;

const GenerateAssessmentSummaryOutputSchema = z.object({
  summary: z.string(),
});
export type GenerateAssessmentSummaryOutput = z.infer<typeof GenerateAssessmentSummaryOutputSchema>;

const gateway = new AIGateway();

export async function generateAssessmentSummary(input: GenerateAssessmentSummaryInput): Promise<GenerateAssessmentSummaryOutput> {
  const assessmentData = input.responses.map(r =>
    `- Category: ${r.category}\n  Question: ${r.question}\n  Answer: "${r.answer}" (Score: ${r.score})`
  ).join('\n');

  const prompt = `Assessment Data:\n${assessmentData}`;

  const systemPrompt = `You are an expert business consultant for Zimbabwean SMEs. Analyze the digital readiness assessment responses.

Each answer has a score from 1 (digitally basic) to 4 (digitally advanced).

Based on the data, provide a concise, insightful summary:
1. Identify the single strongest area (highest average score).
2. Identify the single weakest area (lowest average score).
3. Provide 2-3 actionable recommendations tailored to Zimbabwean context.
4. Keep under 100 words. Be encouraging and direct.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 512,
  });

  return { summary: result.content };
}
