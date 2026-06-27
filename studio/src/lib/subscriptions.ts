
export const PLAN_ORDER = ['Free', 'Growth', 'Tender Starter', 'Pro', 'Enterprise'] as const;
export type PlanTier = typeof PLAN_ORDER[number];

import type { PlanName } from '@/types/user';

export function normalizePlanName(plan: string | null | undefined): PlanName {
  const rawValue = (plan ?? 'Free').toString().trim();
  const normalizedKey = rawValue.toLowerCase().replace(/[_\s]+/g, ' ');

  const aliases: Record<string, PlanName> = {
    'free': 'Free',
    'growth': 'Growth',
    'tender starter': 'Tender Starter',
    'tender starter plan': 'Tender Starter',
    'pro': 'Pro',
    'enterprise': 'Enterprise',
  };

  return aliases[normalizedKey] ?? (PLAN_ORDER.includes(rawValue as PlanTier) ? (rawValue as PlanName) : 'Free');
}

export function normalizeSubscriptionPlanId(plan: string | null | undefined): 'free' | 'growth' | 'tender_starter' | 'pro' | 'enterprise' {
  const normalized = normalizePlanName(plan);
  switch (normalized) {
    case 'Growth': return 'growth';
    case 'Tender Starter': return 'tender_starter';
    case 'Pro': return 'pro';
    case 'Enterprise': return 'enterprise';
    default: return 'free';
  }
}

export function getPlanConfig(plan: string | null | undefined): SubscriptionPlan {
  const normalizedPlan = normalizePlanName(plan);
  return subscriptionPlans.find((candidate) => candidate.name === normalizedPlan) ?? subscriptionPlans[0];
}

export function getPlanCredits(plan: string | null | undefined) {
  return getPlanConfig(plan).credits;
}

export interface SubscriptionPlan {
    name: PlanTier;
    price: number;
    description: string;
    features: string[];
    credits: {
      logoGeneration: { remaining: number; total: number };
      assessmentSummary: { remaining: number; total: number };
      exportAssessment: { remaining: number; total: number };
      dashboardInsights: { remaining: number; total: number };
      tendersCuration: { remaining: number; total: number };
      mentorChat: { remaining: number; total: number };
      templateGeneration: { remaining: number; total: number };
      tenderProposal: { remaining: number; total: number };
      taxCopilot: { remaining: number; total: number };
      multiAgentWorkflow: { remaining: number; total: number };
    };
  }

  export const subscriptionPlans: SubscriptionPlan[] = [
    {
      name: 'Free',
      price: 0,
      description: 'Get a taste of the platform with basic access.',
      features: [
        '1 Assessment Summary',
        '5 Template Generations',
        '10 AI Mentor Messages',
        '5 Logo Generations'
      ],
      credits: {
        assessmentSummary: { remaining: 1, total: 1 },
        exportAssessment: { remaining: 1, total: 1 },
        templateGeneration: { remaining: 5, total: 5 },
        mentorChat: { remaining: 10, total: 10 },
        logoGeneration: { remaining: 5, total: 5 },
        dashboardInsights: { remaining: 10, total: 10 },
        tendersCuration: { remaining: 10, total: 10 },
        tenderProposal: { remaining: 2, total: 2 },
        taxCopilot: { remaining: 5, total: 5 },
        multiAgentWorkflow: { remaining: 3, total: 3 },
      },
    },
    {
      name: 'Growth',
      price: 5,
      description: 'Unlock powerful tools to accelerate your growth.',
      features: [
        '10 Assessment Summaries',
        '50 Template Generations',
        '100 AI Mentor Messages',
        '25 Logo Generations',
        'Unlimited Insights & Curation',
        'Direct Messaging'
      ],
      credits: {
        assessmentSummary: { remaining: 10, total: 10 },
        exportAssessment: { remaining: 10, total: 10 },
        templateGeneration: { remaining: 50, total: 50 },
        mentorChat: { remaining: 100, total: 100 },
        logoGeneration: { remaining: 25, total: 25 },
        dashboardInsights: { remaining: 999, total: 999 },
        tendersCuration: { remaining: 999, total: 999 },
        tenderProposal: { remaining: 20, total: 20 },
        taxCopilot: { remaining: 50, total: 50 },
        multiAgentWorkflow: { remaining: 10, total: 10 },
      },
    },
    {
      name: 'Tender Starter',
      price: 10,
      description: 'Win more government contracts with premium tender intelligence.',
      features: [
        'Unlimited Tenders Curation',
        '25 Assessment Summaries',
        '100 AI Mentor Messages',
        '50 Template Generations',
        '10 Tender Proposals (Bid Writer)',
        'PRAZ Compliance Tools',
        'Daily Personalized Briefs',
      ],
      credits: {
        assessmentSummary: { remaining: 25, total: 25 },
        exportAssessment: { remaining: 5, total: 5 },
        templateGeneration: { remaining: 50, total: 50 },
        mentorChat: { remaining: 100, total: 100 },
        logoGeneration: { remaining: 10, total: 10 },
        dashboardInsights: { remaining: 999, total: 999 },
        tendersCuration: { remaining: 9999, total: 9999 },
        tenderProposal: { remaining: 10, total: 10 },
        taxCopilot: { remaining: 50, total: 50 },
        multiAgentWorkflow: { remaining: 25, total: 25 },
      },
    },
    {
      name: 'Pro',
      price: 15,
      description: 'For power users who need unlimited access.',
      features: [
        'Unlimited Assessment Summaries',
        'Unlimited Template Generations',
        'Unlimited AI Mentor Messages',
        '100 Logo Generations',
        'Priority Support',
        'Community Post Analytics'
      ],
      credits: {
        assessmentSummary: { remaining: 999, total: 999 },
        exportAssessment: { remaining: 999, total: 999 },
        templateGeneration: { remaining: 999, total: 999 },
        mentorChat: { remaining: 999, total: 999 },
        logoGeneration: { remaining: 100, total: 100 },
        dashboardInsights: { remaining: 9999, total: 9999 },
        tendersCuration: { remaining: 9999, total: 9999 },
        tenderProposal: { remaining: 999, total: 999 },
        taxCopilot: { remaining: 9999, total: 9999 },
        multiAgentWorkflow: { remaining: 999, total: 999 },
      },
    },
    {
      name: 'Enterprise',
      price: 0,
      description: 'Custom enterprise solutions for large organizations.',
      features: [
        'Everything in Pro',
        'White-label Reports',
        'API Access',
        'Custom Integrations',
        'Dedicated Account Manager',
        'SLA Guarantee'
      ],
      credits: {
        assessmentSummary: { remaining: 9999, total: 9999 },
        exportAssessment: { remaining: 9999, total: 9999 },
        templateGeneration: { remaining: 9999, total: 9999 },
        mentorChat: { remaining: 9999, total: 9999 },
        logoGeneration: { remaining: 9999, total: 9999 },
        dashboardInsights: { remaining: 9999, total: 9999 },
        tendersCuration: { remaining: 9999, total: 9999 },
        tenderProposal: { remaining: 9999, total: 9999 },
        taxCopilot: { remaining: 9999, total: 9999 },
        multiAgentWorkflow: { remaining: 9999, total: 9999 },
      },
    },
  ];
  