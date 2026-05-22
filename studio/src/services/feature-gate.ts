import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { subscriptionPlans, PLAN_ORDER } from '@/lib/subscriptions';

import type { PlanName } from '@/types/user';
import type { UserRole } from '@/services/permissions';

export type { PlanName };
export type FeatureName = 'logoGeneration' | 'assessmentSummary' | 'exportAssessment' | 'dashboardInsights' | 'tendersCuration' | 'tendersRegional' | 'mentorChat' | 'templateGeneration' | 'tenderProposal' | 'directMessages' | 'communityPostAnalytics' | 'prioritySupport' | 'whiteLabelAppearance' | 'taxCopilot' | 'prazCompliance';

export function getTierLevel(plan: PlanName): number {
  return PLAN_ORDER.indexOf(plan);
}

export function isTierAtLeast(userPlan: PlanName, requiredPlan: PlanName): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);
}

interface CreditGate {
  type: 'credit';
  creditKey: string;
}

interface TierGate {
  type: 'tier';
  minTier: PlanName;
}

type FeatureGate = CreditGate | TierGate;

const FEATURE_GATES: Record<string, FeatureGate> = {
  assessmentSummary:     { type: 'credit', creditKey: 'assessmentSummary' },
  exportAssessment:      { type: 'credit', creditKey: 'exportAssessment' },
  templateGeneration:    { type: 'credit', creditKey: 'templateGeneration' },
  mentorChat:            { type: 'credit', creditKey: 'mentorChat' },
  logoGeneration:        { type: 'credit', creditKey: 'logoGeneration' },
  dashboardInsights:     { type: 'credit', creditKey: 'dashboardInsights' },
  tendersCuration:       { type: 'credit', creditKey: 'tendersCuration' },
  taxCopilot:            { type: 'credit', creditKey: 'taxCopilot' },
  tenderProposal:        { type: 'credit', creditKey: 'tenderProposal' },
  tendersRegional:       { type: 'tier', minTier: 'Growth' },
  directMessages:        { type: 'tier', minTier: 'Growth' },
  prazCompliance:        { type: 'tier', minTier: 'Tender Starter' },
  communityPostAnalytics: { type: 'tier', minTier: 'Pro' },
  prioritySupport:       { type: 'tier', minTier: 'Pro' },
  whiteLabelAppearance:  { type: 'tier', minTier: 'Enterprise' },
};

export interface UpgradeInfo {
  upgradeTo: PlanName | null;
  price: number;
  message: string;
  feature: string;
}

const UPGRADE_PATHS: Record<PlanName, Omit<UpgradeInfo, 'feature'>> = {
  Free:           { upgradeTo: 'Growth', price: 5, message: 'Unlock more tools for $5/mo.' },
  Growth:         { upgradeTo: 'Tender Starter', price: 10, message: 'Get unlimited tenders + PRAZ tools for $10/mo.' },
  'Tender Starter': { upgradeTo: 'Pro', price: 15, message: 'Go unlimited on everything for $15/mo.' },
  Pro:            { upgradeTo: 'Enterprise', price: 0, message: 'Contact us for custom enterprise pricing.' },
  Enterprise:     { upgradeTo: null, price: 0, message: '' },
};

export interface AccessResult {
  allowed: boolean;
  reason?: 'insufficient_tier' | 'insufficient_credits';
  remaining?: number;
  upgrade?: UpgradeInfo;
  message: string;
}

export interface UserPlanData {
  plan: PlanName;
  usage: Record<string, { remaining: number; total: number }>;
  role: UserRole | null;
}

export async function getUserPlanData(userId: string): Promise<UserPlanData> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) throw new Error('User not found');
  const data = userDoc.data();
  return {
    plan: (data.plan as PlanName) || 'Free',
    usage: (data.usage as Record<string, { remaining: number; total: number }>) || {},
    role: (data.role as UserRole) ?? null,
  };
}

export function getUpgradePath(currentPlan: PlanName, feature: FeatureName): UpgradeInfo {
  return { ...UPGRADE_PATHS[currentPlan], feature: feature.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()) };
}

export async function checkFeatureAccess(userId: string, feature: FeatureName): Promise<AccessResult> {
  const { plan, usage, role } = await getUserPlanData(userId);

  if (role === 'super_admin') {
    return { allowed: true, message: '' };
  }

  const gate = FEATURE_GATES[feature];

  if (!gate) return { allowed: true, message: '' };

  if (gate.type === 'tier') {
    if (!isTierAtLeast(plan, gate.minTier)) {
      return {
        allowed: false,
        reason: 'insufficient_tier',
        upgrade: getUpgradePath(plan, feature),
        message: `${feature.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} requires the ${gate.minTier} plan. Upgrade to unlock.`,
      };
    }
    return { allowed: true, message: '' };
  }

  const credit = usage[gate.creditKey];
  const remaining = credit?.remaining ?? 0;

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: 'insufficient_credits',
      remaining: 0,
      upgrade: getUpgradePath(plan, feature),
      message: `You've used all your ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()} credits. ${UPGRADE_PATHS[plan].message}`,
    };
  }

  return { allowed: true, remaining, message: '' };
}

export async function checkAndDecrementUsage(userId: string, feature: FeatureName): Promise<{ success: boolean; message: string; upgrade?: UpgradeInfo }> {
  const gate = FEATURE_GATES[feature];
  if (!gate || gate.type === 'tier') {
    const access = await checkFeatureAccess(userId, feature);
    return { success: access.allowed, message: access.message, upgrade: access.upgrade };
  }

  const userDocRef = doc(db, 'users', userId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) throw new Error('User not found.');

      const userData = userDoc.data();
      if (userData.role === 'super_admin') {
        return { success: true, message: 'Super admin — no usage deducted.' };
      }

      const plan = (userData.plan as PlanName) || 'Free';
      const usage = userData.usage?.[gate.creditKey];

      if (!usage || usage.remaining === undefined) {
        const planIndex = PLAN_ORDER.indexOf(plan);
        const planCredits = planIndex < subscriptionPlans.length ? subscriptionPlans[planIndex]?.credits : null;
        const total = planCredits?.[gate.creditKey as keyof typeof planCredits]?.total ?? 999;
        transaction.update(userDocRef, {
          [`usage.${gate.creditKey}.remaining`]: total - 1,
          [`usage.${gate.creditKey}.total`]: total,
        });
        return { success: true, message: "Usage decremented successfully." };
      }

      if (usage.remaining <= 0) {
        throw { code: 'limit_reached', plan, feature };
      }

      transaction.update(userDocRef, {
        [`usage.${gate.creditKey}.remaining`]: usage.remaining - 1,
      });

      return { success: true, message: "Usage decremented successfully." };
    });

    return result;
  } catch (error: any) {
    if (error.code === 'limit_reached') {
      const upgrade = getUpgradePath(error.plan, feature);
      return { success: false, message: upgrade.message, upgrade };
    }
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}
