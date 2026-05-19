import {
  checkAndDecrementUsage as gateCheckAndDecrement,
  checkFeatureAccess,
  type FeatureName,
  type UpgradeInfo,
  type AccessResult,
} from './feature-gate';

export type { FeatureName, UpgradeInfo, AccessResult };
export { checkFeatureAccess };

export async function checkAndDecrementUsage(userId: string, feature: FeatureName): Promise<{ success: boolean; message: string; upgrade?: UpgradeInfo }> {
  return gateCheckAndDecrement(userId, feature);
}
