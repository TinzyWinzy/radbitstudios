// Referral program
import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface ReferralCode {
  code: string;
  userId: string;
  usageCount: number;
  createdAt: Date;
}

export class ReferralService {
  async getExistingCode(userId: string): Promise<string | null> {
    const snap = await adminDb
      .collection('referral_codes')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0].id;
  }

  async generateCode(userId: string): Promise<string> {
    const existing = await this.getExistingCode(userId);
    if (existing) return existing;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];

    await adminDb.doc(`referral_codes/${code}`).set({
      userId,
      code,
      usageCount: 0,
      maxUses: 50,
      createdAt: new Date(),
    });

    return code;
  }

  async applyReferral(referralCode: string, newUserId: string): Promise<{ success: boolean; message: string }> {
    const codeRef = adminDb.doc(`referral_codes/${referralCode}`);
    const codeDoc = await codeRef.get();
    if (!codeDoc.exists) return { success: false, message: 'Invalid referral code' };

    const data = codeDoc.data()!;
    if (data.usageCount >= (data.maxUses || 50)) return { success: false, message: 'Referral code has expired' };

    try {
      await adminDb.runTransaction(async (transaction) => {
        const codeSnap = await transaction.get(codeRef);
        if (!codeSnap.exists) throw new Error('Code gone');

        transaction.update(codeRef, { usageCount: FieldValue.increment(1) });

        // Award 100 AI credits to referrer
        const referrerRef = adminDb.doc(`users/${data.userId}`);
        transaction.update(referrerRef, {
          [`usage.templateGeneration.remaining`]: FieldValue.increment(100),
          [`usage.templateGeneration.total`]: FieldValue.increment(100),
        });

        // Award 50 AI credits to new user
        const newUserRef = adminDb.doc(`users/${newUserId}`);
        transaction.set(newUserRef, {
          [`usage.templateGeneration.remaining`]: FieldValue.increment(50),
          [`usage.templateGeneration.total`]: FieldValue.increment(50),
        }, { merge: true });
      });

      return { success: true, message: 'Referral applied! You both get bonus AI credits.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to apply referral' };
    }
  }
}
