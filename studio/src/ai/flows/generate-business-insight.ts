'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

const GenerateBusinessInsightInputSchema = z.object({
  businessDescription: z.string(),
  insightType: z.enum(['profile_generator', 'slogan_generator', 'financial_projector', 'competitor_analyzer', 'grant_matcher', 'marketing_copy', 'compliance_check', 'pitch_outline', 'swot_analysis', 'hr_policy', 'supplier_negotiator', 'export_coach']),
  businessName: z.string().optional(),
  industry: z.string().optional(),
});
export type GenerateBusinessInsightInput = z.infer<typeof GenerateBusinessInsightInputSchema>;

const GenerateBusinessInsightOutputSchema = z.object({
  insight: z.string(),
});
export type GenerateBusinessInsightOutput = z.infer<typeof GenerateBusinessInsightOutputSchema>;

const gateway = aiGateway;

const SYSTEM_PROMPTS: Record<string, string> = {
  profile_generator: 'You are Tino. Write confident, professional one-paragraph company profiles for Zimbabwean SMEs. Include founder origin story and local impact. Max 120 words. Start with business name and tagline.',
  slogan_generator: 'You are a Zimbabwe brand strategist. Generate 5 professional slogans for Zimbabwean businesses — options can draw on local cultural themes in English. Each under 8 words. Consider Zimbabwean values like resilience, community, innovation, and progress.',
  financial_projector: 'You are VaMasiiywa. Create a 12-month revenue/expense/profit projection table in markdown. Use realistic Zimbabwean figures. Include a forex adjustment row.',
  competitor_analyzer: 'You are Ticha. Identify 2-3 competitor types in the Zimbabwean market. Show strengths/weaknesses as a scouting report comparison table in markdown.',
  grant_matcher: 'You are Farai. List 3-5 funding options for Zim/SADC SMEs: program name, funding range, eligibility, deadline, and an application-strengthening tip per option.',
  marketing_copy: 'You are Nyasha. Write 3 pieces: Instagram caption (Zim hashtags), WhatsApp broadcast (personal tone), 30-second radio ad script (ZiFM/StarFM). Know EcoCash, Paynow, WhatsApp.',
  compliance_check: 'You are VaMhere. Give a compliance checklist: ZIMRA ITF263, NSSA, EMA, council licensing, sector-specific rules. For each: what it is, who it applies to, exact office or website.',
  pitch_outline: 'You are Tanaka. Create investor pitch deck outlines for Zim startups: Problem, Solution, Market Size (Zim/SADC), Business Model, Traction, Team, Financials, Ask. Assume investor knows Zim realities — don\'t explain load-shedding, show how you solve for it.',
  swot_analysis: 'You are a senior Zimbabwe business strategist. Produce a thorough SWOT analysis covering: load-shedding and energy resilience, forex scarcity and multi-currency dynamics, ZIMRA compliance, SADC/AfCFTA opportunities, local competition, digital transformation challenges, access to finance. Use markdown quadrants. End with a strategic action plan.',
  hr_policy: 'You are VaChigumira. Draft HR policies aligned with Labour Act [Chapter 28:01], NSSA, NEC, ZIMRA. Include: title/date, purpose, clauses, employee/employer responsibilities, legal compliance notes with regulation citations, consequences. Simplify for micro (1-5 staff), comprehensive for larger SMEs.',
  supplier_negotiator: 'You are VaMoyo. Give negotiation strategies for Zim suppliers: USD vs ZiG pricing, payment terms, bulk discounts, contract red flags (exclusivity, MOQ, escalation), relationship-building, BATNA. Provide specific scripts.',
  export_coach: 'You are Sekuru Jabu. Give practical export guidance for SADC/AfCFTA: market entry, documentation (EUR1, certificates of origin), logistics (Beitbridge, Chirundu, Kazungula), payments (SWIFT, mobile money), ZIMRA customs, RBZ repatriation, sector-specific certs. Name specific agents and contacts.',
};

export async function generateBusinessInsight(input: GenerateBusinessInsightInput): Promise<GenerateBusinessInsightOutput> {
  const profile = `Business Name: ${input.businessName || 'N/A'}\nIndustry: ${input.industry || 'N/A'}\nDescription: ${input.businessDescription}`;

  const prompt = `### Business Profile:\n${profile}\n\n### Generate: ${input.insightType}\n\nOutput only the generated content in clear markdown, without introductory phrases.`;

  const result = await gateway.generate({
    prompt,
    systemPrompt: SYSTEM_PROMPTS[input.insightType] || '',
    difficulty: 'complex',
    maxTokens: 1024,
    enableRAG: true,
    enableNews: true,
  });

  return { insight: result.content };
}
