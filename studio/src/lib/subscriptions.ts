
export interface SubscriptionPlan {
    name: 'Free' | 'Growth' | 'Pro';
    price: number;
    description: string;
    features: string[];
    credits: {
      logoGeneration: { remaining: number; total: number };
      assessmentSummary: { remaining: number; total: number };
      dashboardInsights: { remaining: number; total: number };
      tendersCuration: { remaining: number; total: number };
      mentorChat: { remaining: number; total: number };
      templateGeneration: { remaining: number; total: number };
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
        templateGeneration: { remaining: 5, total: 5 },
        mentorChat: { remaining: 10, total: 10 },
        logoGeneration: { remaining: 5, total: 5 },
        dashboardInsights: { remaining: 10, total: 10 },
        tendersCuration: { remaining: 10, total: 10 },
      },
    },
    {
      name: 'Growth',
      price: 15,
      description: 'Unlock powerful tools to accelerate your growth.',
      features: [
        '10 Assessment Summaries',
        '50 Template Generations',
        '100 AI Mentor Messages',
        '25 Logo Generations',
        'Unlimited Insights & Curation'
      ],
      credits: {
        assessmentSummary: { remaining: 10, total: 10 },
        templateGeneration: { remaining: 50, total: 50 },
        mentorChat: { remaining: 100, total: 100 },
        logoGeneration: { remaining: 25, total: 25 },
        dashboardInsights: { remaining: 999, total: 999 }, // Using a high number for "unlimited"
        tendersCuration: { remaining: 999, total: 999 },
      },
    },
    {
      name: 'Pro',
      price: 40,
      description: 'For power users who need unlimited access.',
      features: [
        'Unlimited Assessment Summaries',
        'Unlimited Template Generations',
        'Unlimited AI Mentor Messages',
        '100 Logo Generations',
        'Priority Support'
      ],
      credits: {
        assessmentSummary: { remaining: 999, total: 999 },
        templateGeneration: { remaining: 999, total: 999 },
        mentorChat: { remaining: 999, total: 999 },
        logoGeneration: { remaining: 100, total: 100 },
        dashboardInsights: { remaining: 9999, total: 9999 },
        tendersCuration: { remaining: 9999, total: 9999 },
      },
    },
  ];
  