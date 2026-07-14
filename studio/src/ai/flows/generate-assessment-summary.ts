'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';
import {
  checkTextQuality,
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
  industry: z.string().optional(),
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  userId: z.string().optional(),
});
export type GenerateAssessmentSummaryInput = z.infer<typeof GenerateAssessmentSummaryInputSchema>;

const GenerateAssessmentSummaryOutputSchema = z.object({
  summary: z.string(),
});
export type GenerateAssessmentSummaryOutput = z.infer<typeof GenerateAssessmentSummaryOutputSchema>;

const gateway = aiGateway;

function buildPrompt(input: GenerateAssessmentSummaryInput): { prompt: string; systemPrompt: string } {
  const assessmentData = input.responses.map(r =>
    `- Category: ${r.category}\n  Question: ${r.question}\n  Answer: "${r.answer}" (Score: ${r.score})`
  ).join('\n');

  const businessContext = [
    input.industry && `Industry: ${input.industry}`,
    input.businessName && `Business: ${input.businessName}`,
    input.businessDescription && `Profile: ${input.businessDescription}`,
  ].filter(Boolean).join('\n');

  return {
    prompt: `Business Context:\n${businessContext || 'N/A'}\n\nAssessment Data:\n${assessmentData}`,
    systemPrompt: `You are a professional Zimbabwe business assessor with experience evaluating SMEs across multiple sectors. Grade objectively on a 1-4 scale. Structure each assessment as: "Category — Score/4 — Key Finding". Give 2-3 actionable recommendations referencing real Zimbabwe resources (ZimTrade, POTRAZ, ZIMRA, RBZ, ZIDA, PRAZ). Be direct about weaknesses without sugar-coating. Keep under 100 words. Be specific with scores, categories, industry context, and concrete next steps.`,
  };
}

export async function generateAssessmentSummary(input: GenerateAssessmentSummaryInput): Promise<GenerateAssessmentSummaryOutput> {
  const { prompt, systemPrompt } = buildPrompt(input);

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 512,
    userId: input.userId,
    enableRAG: true,
    enableNews: true,
  });

  let summary = result.content;
  const qc = checkTextQuality(summary, SUMMARY_QUALITY_THRESHOLDS);

  if (!qc.passed) {
    const retryResult = await gateway.generate({
      prompt: `${prompt}\n\nYour previous response had these issues: ${qc.issues.join('; ')}. Fix them. Keep under 100 words.`,
      systemPrompt: `You are a professional Zimbabwe business assessor. Grade fairly on 1-4 scale. Give scores, categories, 2-3 recommendations with Zim context. Under 100 words.`,
      difficulty: 'simple',
      maxTokens: 512,
    });
    summary = retryResult.content;
  }

  return { summary };
}
