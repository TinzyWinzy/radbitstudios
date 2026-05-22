'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

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

const gateway = new AIGateway();

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

  const systemPrompt = `You are an export readiness consultant for Zimbabwean SMEs seeking to trade across SADC and under AfCFTA. Analyze the business's responses and industry context to provide practical, actionable export readiness guidance.

Generate the following as a JSON object with these exact keys:
{
  "readinessScore": 0-100,
  "strengths": ["strength 1", "strength 2"],
  "gaps": ["gap 1", "gap 2"],
  "recommendedMarkets": ["market 1", "market 2"],
  "requiredCertifications": ["cert 1", "cert 2"],
  "summary": "A concise summary of export readiness"
}

1. readinessScore: Overall export readiness from 0 (not ready) to 100 (fully ready).
2. strengths: 2-3 areas where the business shows export readiness strength (tailored to their industry).
3. gaps: 2-3 critical gaps that need addressing for successful cross-border trade (industry-specific).
4. recommendedMarkets: 2-3 SADC member states the business is best positioned to export to based on their industry and profile.
5. requiredCertifications: 2-3 certifications or compliance requirements relevant to their industry and export journey.
6. summary: Under 100 words. Be encouraging and direct.

Return ONLY valid JSON.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 1024,
    jsonMode: true,
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
