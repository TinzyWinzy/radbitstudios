'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

const ExportAssessmentResponseSchema = z.object({
  question: z.string(),
  answer: z.string(),
  score: z.number().describe('Score from 1 (lowest) to 4 (highest)'),
  category: z.string(),
});

const GenerateExportAssessmentInputSchema = z.object({
  responses: z.array(ExportAssessmentResponseSchema),
  industry: z.string().optional(),
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  userId: z.string().optional(),
});
export type GenerateExportAssessmentInput = z.infer<typeof GenerateExportAssessmentInputSchema>;

const GenerateExportAssessmentOutputSchema = z.object({
  readinessScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendedMarkets: z.array(z.string()),
  requiredCertifications: z.array(z.string()),
  summary: z.string(),
});
export type GenerateExportAssessmentOutput = z.infer<typeof GenerateExportAssessmentOutputSchema>;

const gateway = aiGateway;

export async function generateExportAssessment(input: GenerateExportAssessmentInput): Promise<GenerateExportAssessmentOutput> {
  const businessContext = [
    input.industry && `Industry: ${input.industry}`,
    input.businessName && `Business: ${input.businessName}`,
    input.businessDescription && `Profile: ${input.businessDescription}`,
  ].filter(Boolean).join('\n');

  const assessmentData = input.responses.map(r =>
    `- Category: ${r.category}\n  Question: ${r.question}\n  Answer: "${r.answer}" (Score: ${r.score})`
  ).join('\n');

  const prompt = `Business Context:\n${businessContext || 'N/A'}\n\nAssessment Data:\n${assessmentData}`;

  const systemPrompt = `You are Amai Rutendo, ex-ZIMRA customs inspector at Beitbridge. Speak specific, practical terms — "your EUR1 needs ZimTrade stamping." Grade like border inspection: 0-30 = bonded storage, 31-60 = conditional border-ready, 61-85 = SADC clear, 86-100 = AfCFTA ready. Strengths/gaps are industry-specific. Markets consider actual logistics routes. Certifications are sector-specific. Summary under 100 words, ends with practical next step. Output JSON: readinessScore, strengths (2-3), gaps (2-3), recommendedMarkets (2-3 SADC), requiredCertifications (2-3), summary.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 512,
    jsonMode: true,
    userId: input.userId,
    temperature: 0.3,
    enableRAG: true,
    ragCategory: 'zimra_tenders',
    enableNews: true,
  });

  try {
    const parsed = JSON.parse(result.content);
    return {
      readinessScore: parsed.readinessScore ?? 0,
      strengths: parsed.strengths ?? [],
      gaps: parsed.gaps ?? [],
      recommendedMarkets: parsed.recommendedMarkets ?? [],
      requiredCertifications: parsed.requiredCertifications ?? [],
      summary: parsed.summary ?? '',
    };
  } catch {
    return {
      readinessScore: 0,
      strengths: [],
      gaps: [],
      recommendedMarkets: [],
      requiredCertifications: [],
      summary: '',
    };
  }
}
