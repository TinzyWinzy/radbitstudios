import { checkAndDecrementUsage as gateCheckAndDecrement, type FeatureName, type UpgradeInfo } from './feature-gate';

export type { FeatureName, UpgradeInfo };

export async function checkAndDecrementUsage(userId: string, feature: FeatureName): Promise<{ success: boolean; message: string; upgrade?: UpgradeInfo }> {
  return gateCheckAndDecrement(userId, feature);
}
