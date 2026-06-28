import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Payout, PayoutStatus } from '@/types/partner';

const COLLECTION = 'payouts';

export class PayoutService {
  async getById(id: string): Promise<Payout | null> {
    const snap = await adminDb.collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Payout;
  }

  async create(data: Omit<Payout, 'id' | 'status' | 'requestedAt'>): Promise<string> {
    const docRef = await adminDb.collection(COLLECTION).add({
      ...data,
      status: 'pending',
      requestedAt: FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  async updateStatus(id: string, status: PayoutStatus, providerRef?: string): Promise<void> {
    const update: Record<string, unknown> = { status };
    if (status === 'processing' || status === 'sent') update.processedAt = FieldValue.serverTimestamp();
    if (providerRef) update.providerRef = providerRef;
    await adminDb.collection(COLLECTION).doc(id).update(update);
  }

  async getByPartner(partnerId: string): Promise<Payout[]> {
    const snap = await adminDb
      .collection(COLLECTION)
      .where('partnerId', '==', partnerId)
      .orderBy('requestedAt', 'desc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Payout);
  }

  async getPending(): Promise<Payout[]> {
    const snap = await adminDb
      .collection(COLLECTION)
      .where('status', '==', 'pending')
      .orderBy('requestedAt', 'asc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Payout);
  }

  async getByStatus(status: PayoutStatus): Promise<Payout[]> {
    const snap = await adminDb
      .collection(COLLECTION)
      .where('status', '==', status)
      .orderBy('requestedAt', 'desc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Payout);
  }
}

export const payoutService = new PayoutService();
