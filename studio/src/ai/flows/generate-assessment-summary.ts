'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';
import {
  checkTextQuality,
  buildRegenerationPrompt,
  SUMMARY_QUALITY_THRESHOLDS,
} from '@/ai/quality-control';

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

function buildPrompt(responses: GenerateAssessmentSummaryInput['responses']): { prompt: string; systemPrompt: string } {
  const assessmentData = responses.map(r =>
    `- Category: ${r.category}\n  Question: ${r.question}\n  Answer: "${r.answer}" (Score: ${r.score})`
  ).join('\n');

  return {
    prompt: `Assessment Data:\n${assessmentData}`,
    systemPrompt: `You are an expert business consultant for Zimbabwean SMEs. Analyze the digital readiness assessment responses.

Each answer has a score from 1 (digitally basic) to 4 (digitally advanced).

Based on the data, provide a concise, insightful summary:
1. Identify the single strongest area (highest average score).
2. Identify the single weakest area (lowest average score).
3. Provide 2-3 actionable recommendations tailored to Zimbabwean context.
4. Keep under 100 words. Be encouraging and direct.

Write at least 3-4 full sentences. Be specific — mention actual categories, scores, and concrete next steps.`,
  };
}

export async function generateAssessmentSummary(input: GenerateAssessmentSummaryInput): Promise<GenerateAssessmentSummaryOutput> {
  const { prompt, systemPrompt } = buildPrompt(input.responses);

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 512,
  });

  let summary = result.content;
  const qc = checkTextQuality(summary, SUMMARY_QUALITY_THRESHOLDS);

  if (!qc.passed) {
    const retryPrompt = buildRegenerationPrompt(
      `${systemPrompt}\n\n${prompt}`,
      qc.issues
    );
    const retryResult = await gateway.generate({
      prompt: retryPrompt,
      systemPrompt: `You are an expert business consultant for Zimbabwean SMEs. Provide a detailed, specific summary.`,
      difficulty: 'simple',
      maxTokens: 512,
    });
    summary = retryResult.content;
  }

  return { summary };
}
