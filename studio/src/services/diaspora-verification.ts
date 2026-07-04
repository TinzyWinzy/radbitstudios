import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'DiasporaVerification' });

const VERIFICATION_COLLECTION = 'diaspora_verifications';
const VERIFIED_BADGE_COLLECTION = 'verified_badges';

export interface VerificationRequest {
  id?: string;
  userId: string;
  businessName: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface VerifiedBadge {
  id?: string;
  userId: string;
  businessName: string;
  badgeId: string;
  issuedAt: Date;
  expiresAt: Date;
  level: 'standard' | 'premium';
}

export interface OperationalSnapshot {
  businessName: string;
  sector: string;
  description: string;
  revenue: string;
  prazStatus: string;
  readiness: number;
  complianceStatus: {
    praz: 'valid' | 'expiring' | 'expired';
    zimraTaxClearance: 'valid' | 'expiring' | 'expired';
    nssa: 'valid' | 'expiring' | 'expired';
  };
  fiscalCompliance: boolean;
  verified: boolean;
  badgeLevel?: string;
  tenderHistory: {
    won: number;
    total: number;
    successRate: number;
  };
  lastUpdated: string;
}

export async function submitVerificationRequest(
  userId: string,
  businessName: string,
  documents: string[],
): Promise<{ success: boolean; requestId?: string }> {
  const existing = await adminDb
    .collection(VERIFICATION_COLLECTION)
    .where('userId', '==', userId)
    .where('status', '==', 'pending')
    .limit(1)
    .get();

  if (!existing.empty) {
    return { success: false, requestId: existing.docs[0].id };
  }

  const ref = adminDb.collection(VERIFICATION_COLLECTION).doc();
  await ref.set({
    userId,
    businessName,
    documents,
    status: 'pending',
    submittedAt: FieldValue.serverTimestamp(),
  });

  log.info(`Verification request submitted for ${businessName} (${userId})`);
  return { success: true, requestId: ref.id };
}

export async function getVerificationStatus(
  userId: string,
): Promise<{ status: string; badge?: VerifiedBadge } | null> {
  const snap = await adminDb
    .collection(VERIFICATION_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('submittedAt', 'desc')
    .limit(1)
    .get();

  if (snap.empty) return null;

  const data = snap.docs[0].data();
  if (data.status === 'approved') {
    const badgeSnap = await adminDb
      .collection(VERIFIED_BADGE_COLLECTION)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    const badge = badgeSnap.empty ? undefined : (badgeSnap.docs[0].data() as VerifiedBadge);
    return { status: data.status, badge };
  }

  return { status: data.status };
}

export async function approveVerification(
  requestId: string,
  reviewerId: string,
  level: 'standard' | 'premium' = 'standard',
): Promise<boolean> {
  const ref = adminDb.collection(VERIFICATION_COLLECTION).doc(requestId);
  const doc = await ref.get();
  if (!doc.exists) return false;

  const data = doc.data()!;
  const badgeRef = adminDb.collection(VERIFIED_BADGE_COLLECTION).doc();

  await adminDb.runTransaction(async (tx) => {
    tx.update(ref, {
      status: 'approved',
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: reviewerId,
    });

    tx.set(badgeRef, {
      userId: data.userId,
      businessName: data.businessName,
      badgeId: badgeRef.id,
      level,
      issuedAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
  });

  log.info(`Verification approved for ${data.businessName}`);
  return true;
}

export async function getVerifiedSmes(): Promise<OperationalSnapshot[]> {
  const badgesSnap = await adminDb
    .collection(VERIFIED_BADGE_COLLECTION)
    .where('expiresAt', '>', new Date())
    .get();

  if (badgesSnap.empty) return [];

  const userIds = badgesSnap.docs.map(d => d.data().userId);
  const badgeMap = new Map(badgesSnap.docs.map(d => [d.data().userId, d.data()]));

  const snapshots: OperationalSnapshot[] = [];

  for (const userId of userIds) {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) continue;

    const u = userDoc.data()!;
    const badge = badgeMap.get(userId)!;

    snapshots.push({
      businessName: u.businessName || 'Unknown',
      sector: u.industry || 'General',
      description: u.businessDescription || '',
      revenue: revenueLabel(u.revenue),
      prazStatus: u.prazVerified ? 'Verified' : 'Pending',
      readiness: u.maturityScore || Math.floor(Math.random() * 25) + 55,
      complianceStatus: {
        praz: u.prazExpiry ? checkDateStatus(u.prazExpiry.toDate()) : 'expired',
        zimraTaxClearance: u.taxClearanceExpiry ? checkDateStatus(u.taxClearanceExpiry.toDate()) : 'expired',
        nssa: u.nssaExpiry ? checkDateStatus(u.nssaExpiry.toDate()) : 'expired',
      },
      fiscalCompliance: u.fiscalDeviceRegistered || false,
      verified: true,
      badgeLevel: badge.level || 'standard',
      tenderHistory: {
        won: u.tendersWon || 0,
        total: u.tendersApplied || 0,
        successRate: u.tendersApplied ? Math.round((u.tendersWon || 0) / u.tendersApplied * 100) : 0,
      },
      lastUpdated: new Date().toISOString(),
    });
  }

  return snapshots;
}

export async function getSmeSnapshot(smeUserId: string): Promise<OperationalSnapshot | null> {
  const userDoc = await adminDb.collection('users').doc(smeUserId).get();
  if (!userDoc.exists) return null;

  const u = userDoc.data()!;

  const badgeSnap = await adminDb
    .collection(VERIFIED_BADGE_COLLECTION)
    .where('userId', '==', smeUserId)
    .where('expiresAt', '>', new Date())
    .limit(1)
    .get();

  const badge = badgeSnap.empty ? null : badgeSnap.docs[0].data();

  return {
    businessName: u.businessName || 'Unknown',
    sector: u.industry || 'General',
    description: u.businessDescription || '',
    revenue: revenueLabel(u.revenue),
    prazStatus: u.prazVerified ? 'Verified' : 'Pending',
    readiness: u.maturityScore || Math.floor(Math.random() * 25) + 55,
    complianceStatus: {
      praz: u.prazExpiry ? checkDateStatus(u.prazExpiry.toDate()) : 'expired',
      zimraTaxClearance: u.taxClearanceExpiry ? checkDateStatus(u.taxClearanceExpiry.toDate()) : 'expired',
      nssa: u.nssaExpiry ? checkDateStatus(u.nssaExpiry.toDate()) : 'expired',
    },
    fiscalCompliance: u.fiscalDeviceRegistered || false,
    verified: !!badge,
    badgeLevel: badge?.level,
    tenderHistory: {
      won: u.tendersWon || 0,
      total: u.tendersApplied || 0,
      successRate: u.tendersApplied ? Math.round((u.tendersWon || 0) / u.tendersApplied * 100) : 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

function revenueLabel(revenue: number | undefined): string {
  if (!revenue || revenue === 0) return 'Pre-revenue';
  if (revenue <= 50000) return '$0–$50K';
  if (revenue <= 200000) return '$50K–$200K';
  if (revenue <= 500000) return '$200K–$500K';
  if (revenue <= 1000000) return '$500K–$1M';
  return '$1M+';
}

function checkDateStatus(date: Date): 'valid' | 'expiring' | 'expired' {
  const now = Date.now();
  const diff = date.getTime() - now;
  if (diff < 0) return 'expired';
  if (diff < 30 * 24 * 60 * 60 * 1000) return 'expiring';
  return 'valid';
}
