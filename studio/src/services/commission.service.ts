import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Commission, CommissionStatus } from '@/types/partner';

const COLLECTION = 'commissions';

export class CommissionService {
  async getById(id: string): Promise<Commission | null> {
    const snap = await adminDb.collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Commission;
  }

  async create(data: Omit<Commission, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const docRef = await adminDb.collection(COLLECTION).add({
      ...data,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  async updateStatus(id: string, status: CommissionStatus): Promise<void> {
    const update: Record<string, unknown> = { status };
    if (status === 'approved') update.approvedAt = FieldValue.serverTimestamp();
    if (status === 'paid') update.paidAt = FieldValue.serverTimestamp();
    await adminDb.collection(COLLECTION).doc(id).update(update);
  }

  async getByPartner(partnerId: string): Promise<Commission[]> {
    const snap = await adminDb
      .collection(COLLECTION)
      .where('partnerId', '==', partnerId)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Commission);
  }

  async getPendingApproval(afterDays: number = 14): Promise<Commission[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - afterDays);
    const snap = await adminDb
      .collection(COLLECTION)
      .where('status', '==', 'pending')
      .where('createdAt', '<=', cutoff)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Commission);
  }

  async getByPartnerAndStatus(partnerId: string, status: CommissionStatus): Promise<Commission[]> {
    const snap = await adminDb
      .collection(COLLECTION)
      .where('partnerId', '==', partnerId)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Commission);
  }

  async getByClient(clientId: string): Promise<Commission[]> {
    const snap = await adminDb
      .collection(COLLECTION)
      .where('clientId', '==', clientId)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Commission);
  }
}

export const commissionService = new CommissionService();
