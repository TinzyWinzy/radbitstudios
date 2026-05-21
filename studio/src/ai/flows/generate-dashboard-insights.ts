'use server';

import { z } from 'zod';
import { AIGateway } from '@/services/ai/ai-gateway';
import {
  checkListQuality,
  buildRegenerationPrompt,
  TIP_QUALITY_THRESHOLDS,
} from '@/ai/quality-control';

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

1. dailyTips: Exactly 3 short, actionable tips relevant to their industry in Zimbabwe. Each tip must be at least 2 sentences.
2. recommendations: Exactly 2 strategic, personalized recommendations based on their specific business description. Each must be at least 2 sentences.

Keep language encouraging, simple, and direct. Be specific — reference real Zimbabwean resources or tools where relevant. Return ONLY valid JSON.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 1024,
    jsonMode: true,
  });

  let parsed: any;
  try {
    parsed = JSON.parse(result.content);
  } catch {
    parsed = null;
  }

  let dailyTips: string[] = parsed?.dailyTips ?? [];
  let recommendations: string[] = parsed?.recommendations ?? [];

  const tipsQc = checkListQuality(dailyTips, 'dailyTips', TIP_QUALITY_THRESHOLDS);
  const recsQc = checkListQuality(recommendations, 'recommendations', TIP_QUALITY_THRESHOLDS);

  if (!tipsQc.passed || !recsQc.passed) {
    const issues = [...tipsQc.issues, ...recsQc.issues];
    const retryPrompt = buildRegenerationPrompt(
      `${systemPrompt}\n\n${prompt}`,
      issues
    );
    const retryResult = await gateway.generate({
      prompt: retryPrompt,
      systemPrompt: `Generate valid JSON with "dailyTips" (3 items) and "recommendations" (2 items). Be specific and detailed.`,
      difficulty: 'simple',
      maxTokens: 1024,
      jsonMode: true,
    });

    try {
      const retryParsed = JSON.parse(retryResult.content);
      dailyTips = retryParsed?.dailyTips ?? dailyTips;
      recommendations = retryParsed?.recommendations ?? recommendations;
    } catch {
    }
  }

  if (dailyTips.length < 3) {
    const fallbacks = [
      "Review your pricing strategy to stay competitive in your industry.",
      "Set aside time each week to review your business finances.",
      "Engage with your customers on social media to build loyalty.",
    ];
    while (dailyTips.length < 3) {
      dailyTips.push(fallbacks[dailyTips.length]);
    }
  }

  if (recommendations.length < 2) {
    const fallbacks = [
      "Consider registering for the Zimbabwe Investment Authority (ZIA) to explore export opportunities.",
      "Review your current digital tools and identify one area where automation could save time.",
    ];
    while (recommendations.length < 2) {
      recommendations.push(fallbacks[recommendations.length]);
    }
  }

  return { dailyTips, recommendations };
}
