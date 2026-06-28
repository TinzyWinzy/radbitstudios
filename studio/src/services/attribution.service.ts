import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { partnerService } from '@/services/partner.service';
import type { Referral } from '@/types/partner';

const REFERRALS_COL = 'referrals';

/**
 * Track a partner referral click (anonymous visitor arrives with ?ref=).
 */
export async function trackClick(refCode: string, landingPage: string, device?: string): Promise<string | null> {
  const partner = await partnerService.getByReferralCode(refCode);
  if (!partner || !partner.id) return null;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const docRef = await adminDb.collection(REFERRALS_COL).add({
    partnerId: partner.id,
    refCode,
    landingPage,
    device: device || 'unknown',
    clickedAt: FieldValue.serverTimestamp(),
    status: 'clicked',
    expiresAt,
  });

  return docRef.id;
}

/**
 * Attribute a signed-up client to a partner referral.
 * Finds the most recent 'clicked' referral for this partner
 * and updates it to 'signed' status with the client ID.
 */
export async function attributeClient(clientId: string, refCode: string): Promise<string | null> {
  const partner = await partnerService.getByReferralCode(refCode);
  if (!partner || !partner.id) return null;

  const snap = await adminDb
    .collection(REFERRALS_COL)
    .where('partnerId', '==', partner.id)
    .where('refCode', '==', refCode)
    .where('status', '==', 'clicked')
    .orderBy('clickedAt', 'desc')
    .limit(1)
    .get();

  if (snap.empty) return null;

  const docRef = snap.docs[0].ref;
  await docRef.update({
    clientId,
    status: 'signed',
    attributedAt: FieldValue.serverTimestamp(),
  });

  await partnerService.incrementClientCount(partner.id);

  // Store attribution on user doc for commission lookups
  await adminDb.collection('users').doc(clientId).set({
    attributedBy: partner.id,
    attributedByRefCode: refCode,
    attributedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return docRef.id;
}

/** Get referrals by partner ID */
export async function getReferralsByPartner(partnerId: string): Promise<Referral[]> {
  const snap = await adminDb
    .collection(REFERRALS_COL)
    .where('partnerId', '==', partnerId)
    .orderBy('clickedAt', 'desc')
    .limit(50)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Referral);
}
