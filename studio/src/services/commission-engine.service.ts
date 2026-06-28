import { adminDb } from '@/lib/firebase/firebase-admin';
import { partnerService } from '@/services/partner.service';
import { commissionService } from '@/services/commission.service';

/**
 * Calculate commission amount based on plan price and partner rate.
 */
export function calculateCommission(planPrice: number, commissionRate: number): number {
  return Math.round(planPrice * commissionRate * 100) / 100;
}

/**
 * Create a commission when a payment is completed for a partner-attributed client.
 * Looks up the user doc for attributedBy field set during signup attribution.
 */
export async function createCommissionOnPayment(
  userId: string,
  subscriptionId: string,
  planName: string,
  amount: number,
  billingPeriod: string,
): Promise<string | null> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) return null;

  const userData = userDoc.data();
  const partnerId = userData?.attributedBy;
  if (!partnerId) return null;

  const partner = await partnerService.getById(partnerId);
  if (!partner || partner.status !== 'active') return null;

  const commissionAmount = calculateCommission(amount, partner.commissionRate);

  const commissionId = await commissionService.create({
    partnerId,
    clientId: userId,
    subscriptionId,
    planName,
    amount: commissionAmount,
    rate: partner.commissionRate,
    billingPeriod,
  });

  await partnerService.addEarnings(partnerId, commissionAmount);

  return commissionId;
}

/**
 * Approve a pending commission for payout eligibility.
 */
export async function approveCommission(commissionId: string): Promise<void> {
  await commissionService.updateStatus(commissionId, 'approved');
}

/**
 * Get earnings summary for a partner dashboard.
 */
export async function getPartnerEarningsSummary(partnerId: string) {
  const commissions = await commissionService.getByPartner(partnerId);

  const totalCommission = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const pendingCommission = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + (c.amount || 0), 0);
  const approvedCommission = commissions
    .filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + (c.amount || 0), 0);
  const paidCommission = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return {
    totalCommission,
    pendingCommission,
    approvedCommission,
    paidCommission,
    totalCommissions: commissions.length,
  };
}

/**
 * Auto-approve commissions that are past the cooling period.
 */
export async function autoApproveCommissions(daysOld: number = 14): Promise<number> {
  const pending = await commissionService.getPendingApproval(daysOld);
  let approved = 0;
  for (const c of pending) {
    if (c.id) {
      await approveCommission(c.id);
      approved++;
    }
  }
  return approved;
}
