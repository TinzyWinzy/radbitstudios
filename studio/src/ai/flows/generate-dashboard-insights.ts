'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';

const GenerateDashboardInsightsInputSchema = z.object({
  userId: z.string(),
  businessDescription: z.string(),
  industry: z.string(),
});
export type GenerateDashboardInsightsInput = z.infer<typeof GenerateDashboardInsightsInputSchema>;

const GenerateDashboardInsightsOutputSchema = z.object({
  dailyTips: z.array(z.string()),
  recommendations: z.array(z.string()),
});
export type GenerateDashboardInsightsOutput = z.infer<typeof GenerateDashboardInsightsOutputSchema>;

const gateway = new AIGateway();

export async function generateDashboardInsights(input: GenerateDashboardInsightsInput): Promise<GenerateDashboardInsightsOutput> {
  const prompt = `Business Industry: ${input.industry}\nBusiness Description: ${input.businessDescription}`;

  const systemPrompt = `You are an expert business consultant for Zimbabwean SMEs. Generate personalized content for the user's dashboard.

Generate the following as a JSON object with these exact keys:
{
  "dailyTips": ["tip 1", "tip 2", "tip 3"],
  "recommendations": ["rec 1", "rec 2"]
}

1. dailyTips: Exactly 3 short, actionable tips relevant to their industry in Zimbabwe.
2. recommendations: Exactly 2 strategic, personalized recommendations based on their specific business description.

Keep language encouraging, simple, and direct. Return ONLY valid JSON.`;

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
      dailyTips: parsed.dailyTips || [],
      recommendations: parsed.recommendations || [],
    };
  } catch {
    return { dailyTips: [], recommendations: [] };
  }
}
