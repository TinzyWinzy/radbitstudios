import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Partner } from '@/types/partner';
import { computeTier } from '@/services/tiers.service';

const COLLECTION = 'partners';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RBT';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export class PartnerService {
  async getById(id: string): Promise<Partner | null> {
    const snap = await adminDb.collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Partner;
  }

  async getByUid(uid: string): Promise<Partner | null> {
    const snap = await adminDb.collection(COLLECTION).where('uid', '==', uid).limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Partner;
  }

  async getByReferralCode(code: string): Promise<Partner | null> {
    const snap = await adminDb.collection(COLLECTION).where('referralCode', '==', code).limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Partner;
  }

  async create(data: Omit<Partner, 'id' | 'referralCode' | 'tier' | 'commissionRate' | 'totalEarned' | 'totalPaid' | 'clientCount' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const referralCode = generateReferralCode();
    const docRef = await adminDb.collection(COLLECTION).add({
      ...data,
      referralCode,
      tier: 'scout',
      commissionRate: 0.10,
      totalEarned: 0,
      totalPaid: 0,
      clientCount: 0,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<Partner>): Promise<void> {
    await adminDb.collection(COLLECTION).doc(id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async incrementClientCount(id: string): Promise<void> {
    const partner = await this.getById(id);
    if (!partner) return;
    const newCount = (partner.clientCount || 0) + 1;
    const { tier, config } = computeTier(newCount);
    await adminDb.collection(COLLECTION).doc(id).update({
      clientCount: FieldValue.increment(1),
      tier,
      commissionRate: config.rate,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async addEarnings(id: string, amount: number): Promise<void> {
    await adminDb.collection(COLLECTION).doc(id).update({
      totalEarned: FieldValue.increment(amount),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async listAll(): Promise<Partner[]> {
    const snap = await adminDb.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Partner);
  }
}

export const partnerService = new PartnerService();
