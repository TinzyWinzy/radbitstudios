
import { db } from '@/lib/firebase/firebase';
import { doc, runTransaction } from 'firebase/firestore';

export type FeatureName = 'logoGeneration' | 'assessmentSummary' | 'dashboardInsights' | 'tendersCuration' | 'mentorChat' | 'templateGeneration';

/**
 * Checks if a user has enough quota for a feature and decrements the usage count.
 * This function is intended to be called from the CLIENT SIDE where a user is authenticated.
 * @param userId The ID of the user.
 * @param feature The name of the feature being used.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function checkAndDecrementUsage(userId: string, feature: FeatureName): Promise<{success: boolean; message: string}> {
  const userDocRef = doc(db, 'users', userId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('User not found.');
      }
      
      const userData = userDoc.data();
      const usage = userData.usage?.[feature];

      if (!usage || usage.remaining === undefined) {
         // If feature usage doesn't exist, create it with a default. This is a fallback.
        const defaultQuota = 5;
        transaction.update(userDocRef, {
            [`usage.${feature}.remaining`]: defaultQuota - 1,
            [`usage.${feature}.total`]: defaultQuota
        });
        return { success: true, message: "Usage decremented successfully." };
      }

      if (usage.remaining <= 0) {
        // This is not an error, but a business logic failure. We throw to stop the transaction.
        throw new Error(`You have reached your usage limit for this feature.`);
      }

      // Decrement the remaining count
      transaction.update(userDocRef, {
        [`usage.${feature}.remaining`]: usage.remaining - 1,
      });

      return { success: true, message: "Usage decremented successfully." };
    });

    return result;

  } catch (error: any) {
    console.error(`Usage check failed for user ${userId}, feature ${feature}:`, error);
    return { success: false, message: error.message || "An unexpected error occurred during usage check." };
  }
}
