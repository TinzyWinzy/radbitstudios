import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { PLAN_ORDER, normalizePlanName, getPlanCredits } from '@/lib/subscriptions';
import { getCachedUser, setCachedUser, invalidateUserCache } from '@/services/user-cache';

import type { PlanName } from '@/types/user';
import type { UserRole } from '@/services/permissions';

export type { PlanName };
export type FeatureName = 'logoGeneration' | 'assessmentSummary' | 'exportAssessment' | 'dashboardInsights' | 'tendersCuration' | 'tendersRegional' | 'mentorChat' | 'templateGeneration' | 'tenderProposal' | 'directMessages' | 'communityPostAnalytics' | 'prioritySupport' | 'whiteLabelAppearance' | 'taxCopilot' | 'prazCompliance' | 'multiAgentWorkflow';

export function getTierLevel(plan: PlanName): number {
  return PLAN_ORDER.indexOf(normalizePlanName(plan));
}

export function isTierAtLeast(userPlan: PlanName, requiredPlan: PlanName): boolean {
  return PLAN_ORDER.indexOf(normalizePlanName(userPlan)) >= PLAN_ORDER.indexOf(normalizePlanName(requiredPlan));
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
  multiAgentWorkflow:    { type: 'credit', creditKey: 'multiAgentWorkflow' },
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
  const cached = await getCachedUser(userId);
  if (cached && cached.plan) {
    return {
      plan: normalizePlanName(cached.plan as string | undefined),
      usage: (cached.usage as Record<string, { remaining: number; total: number }>) || {},
      role: (cached.role as UserRole) ?? null,
    };
  }
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) throw new Error('User not found');
  const data = userDoc.data();
  const result: UserPlanData = {
    plan: normalizePlanName(data.plan as string | undefined),
    usage: (data.usage as Record<string, { remaining: number; total: number }>) || {},
    role: (data.role as UserRole) ?? null,
  };
  const cacheData: Record<string, unknown> = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const val = data[key];
      if (val && typeof val === 'object' && typeof (val as any).toDate === 'function') {
        cacheData[key] = (val as any).toDate().toISOString();
      } else {
        cacheData[key] = val;
      }
    }
  }
  setCachedUser(userId, cacheData);
  return result;
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

  const normalizedPlan = normalizePlanName(plan);

  if (gate.type === 'tier') {
    if (!isTierAtLeast(normalizedPlan, gate.minTier)) {
      return {
        allowed: false,
        reason: 'insufficient_tier',
        upgrade: getUpgradePath(normalizedPlan, feature),
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
      upgrade: getUpgradePath(normalizedPlan, feature),
      message: `You've used all your ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()} credits. ${UPGRADE_PATHS[normalizedPlan].message}`,
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
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) throw new Error('User not found.');

    const userData = userDoc.data();
    if (userData.role === 'super_admin') {
      return { success: true, message: 'Super admin — no usage deducted.' };
    }

    const plan = normalizePlanName(userData.plan as string | undefined);
    const usage = userData.usage?.[gate.creditKey];

    if (!usage || usage.remaining === undefined) {
      const planCredits = getPlanCredits(plan);
      const total = planCredits?.[gate.creditKey as keyof typeof planCredits]?.total ?? 999;
      await updateDoc(userDocRef, {
        [`usage.${gate.creditKey}.remaining`]: total - 1,
        [`usage.${gate.creditKey}.total`]: total,
      });
      invalidateUserCache(userId);
      return { success: true, message: "Usage decremented successfully." };
    }

    if (usage.remaining <= 0) {
      const upgrade = getUpgradePath(plan, feature);
      return { success: false, message: upgrade.message, upgrade };
    }

    await updateDoc(userDocRef, {
      [`usage.${gate.creditKey}.remaining`]: increment(-1),
    });
    invalidateUserCache(userId);

    return { success: true, message: "Usage decremented successfully." };
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    if (err?.code === 'limit_reached') {
      const upgrade = getUpgradePath(err.plan as PlanName, feature);
      return { success: false, message: upgrade.message, upgrade };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, message: message || "An unexpected error occurred." };
  }
}
