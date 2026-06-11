'use server';

import { z } from 'zod';
import { aiGateway } from '@/services/ai/ai-gateway';

const InputSchema = z.object({
  audience: z.enum(['myself', 'my-business', 'not-sure']),
  need: z.enum(['website', 'online-store', 'business-software', 'consulting', 'ai-tools', 'not-sure']),
  budget: z.enum(['under-500', '500-2000', '2000-10000', 'over-10000', 'not-sure']),
  name: z.string().min(1).max(200),
  company: z.string().optional(),
  industry: z.string().optional(),
  message: z.string().optional(),
});

export type OnboardingChecklistInput = z.infer<typeof InputSchema>;

const ChecklistItemSchema = z.object({
  id: z.string(),
  task: z.string(),
  description: z.string(),
  type: z.enum(['info', 'upload', 'action', 'decision']),
});

const OutputSchema = z.object({
  persona: z.enum(['individual', 'sme', 'enterprise']),
  suggestedPackage: z.string(),
  items: z.array(ChecklistItemSchema).min(1).max(12),
});

export type OnboardingChecklistOutput = z.infer<typeof OutputSchema>;

const gateway = aiGateway;

const FALLBACK: OnboardingChecklistOutput = {
  persona: 'sme',
  suggestedPackage: 'Business Site — $400',
  items: [
    { id: 'intro', task: 'Tell us about your project', description: 'Share more details about what you need', type: 'info' },
    { id: 'goals', task: 'Define your goals', description: 'What do you want to achieve?', type: 'info' },
    { id: 'kickoff', task: 'Schedule a discovery call', description: 'Book a free consultation to discuss next steps', type: 'action' },
  ],
};

function buildPrompt(input: OnboardingChecklistInput): string {
  const audienceLabel =
    input.audience === 'myself' ? 'an individual/freelancer' :
    input.audience === 'my-business' ? 'a business owner' : 'someone not sure what they need';

  const needLabel =
    input.need === 'website' ? 'a website' :
    input.need === 'online-store' ? 'an online store' :
    input.need === 'business-software' ? 'business/ERP software' :
    input.need === 'consulting' ? 'business consulting' :
    input.need === 'ai-tools' ? 'AI tools' : 'help figuring out what they need';

  const budgetLabel =
    input.budget === 'under-500' ? 'under $500' :
    input.budget === '500-2000' ? '$500-$2,000' :
    input.budget === '2000-10000' ? '$2,000-$10,000' :
    input.budget === 'over-10000' ? 'over $10,000' : 'not sure yet';

  return `Client Profile:
- Name: ${input.name}
- Type: ${audienceLabel}
- Need: ${needLabel}
- Budget: ${budgetLabel}
${input.company ? `- Company: ${input.company}` : ''}
${input.industry ? `- Industry: ${input.industry}` : ''}
${input.message ? `- Notes: ${input.message}` : ''}

Generate a personalized onboarding checklist with 4-8 actionable items.`;
}

export async function generateOnboardingChecklistFlow(
  input: OnboardingChecklistInput
): Promise<OnboardingChecklistOutput> {
  const systemPrompt = `You are Tafara, Radbit's onboarding lead. Warm, clear, professional with Zim warmth — "Zvakanaka, I understand exactly what you need." Tailor every checklist to their needs, budget, and tech level.

Client rules: individual (freelancer, tech-nervous → 4-6 simple items, plain language), sme (business owner → 5-8 items including brand/content), enterprise (formal → 6-10 items including RFP, SLA, team intro, milestones).

Item rules: id (kebab-case), task (short actionable title), description (why it matters), type (info/upload/action/decision). Include suggestedPackage with exact Radbit package name and price.

Output JSON: { persona, suggestedPackage, items: [{ id, task, description, type }] }`;

  try {
    const result = await gateway.generate({
      prompt: buildPrompt(input),
      systemPrompt,
      difficulty: 'simple',
      temperature: 0.4,
      maxTokens: 1024,
      jsonMode: true,
    });

    if (result.error) throw new Error(result.error);

    const parsed = OutputSchema.safeParse(JSON.parse(result.content));
    if (parsed.success) return parsed.data;

    console.warn('[OnboardingFlow] AI output validation failed, using fallback');
    return FALLBACK;
  } catch (error) {
    console.error('[OnboardingFlow] Error:', error);
    return FALLBACK;
  }
}
