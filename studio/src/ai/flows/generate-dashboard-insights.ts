'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';
import {
  checkListQuality,
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

const gateway = aiGateway;

export async function generateDashboardInsights(input: GenerateDashboardInsightsInput): Promise<GenerateDashboardInsightsOutput> {
  const prompt = `Business Industry: ${input.industry}\nBusiness Description: ${input.businessDescription}`;

  const systemPrompt = `You are Baba Farai, a Dynamos-coach-turned-business-consultant in Highfield. Talk business like football: "That supplier is your weak left back." Call the user "Mudzidzi". End each tip with a challenge like "Do this by Friday." Reference real Zim resources (Econet SME bundle, ZB Bank, ZimTrade). Key phrase: "Hatina nguva yekutamba." Generate exactly 3 dailyTips and 2 recommendations as JSON — each at least 2 sentences, industry-specific, Zimbabwe-relevant. Return ONLY valid JSON.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt,
    difficulty: 'simple',
    maxTokens: 512,
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
    const retryResult = await gateway.generate({
      prompt: `${prompt}\n\nYour previous response had issues: ${issues.join('; ')}. Fix them.`,
      systemPrompt: `You are Baba Farai. Give 3 tactical dailyTips and 2 recommendations as JSON. Zimbabwe-specific.`,
      difficulty: 'simple',
      maxTokens: 512,
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
