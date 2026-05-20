// Referral program
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc, increment, runTransaction, query, where, collection, getDocs, limit } from 'firebase/firestore';

export interface ReferralCode {
  code: string;
  userId: string;
  usageCount: number;
  createdAt: Date;
}

export class ReferralService {
  async getExistingCode(userId: string): Promise<string | null> {
    const q = query(
      collection(db, 'referral_codes'),
      where('userId', '==', userId),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].id;
  }

  async generateCode(userId: string): Promise<string> {
    const existing = await this.getExistingCode(userId);
    if (existing) return existing;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];

    await setDoc(doc(db, 'referral_codes', code), {
      userId,
      code,
      usageCount: 0,
      maxUses: 50,
      createdAt: new Date(),
    });

    return code;
  }

  async applyReferral(referralCode: string, newUserId: string): Promise<{ success: boolean; message: string }> {
    const codeRef = doc(db, 'referral_codes', referralCode);
    const codeDoc = await getDoc(codeRef);
    if (!codeDoc.exists()) return { success: false, message: 'Invalid referral code' };

    const data = codeDoc.data();
    if (data.usageCount >= (data.maxUses || 50)) return { success: false, message: 'Referral code has expired' };

    try {
      await runTransaction(db, async (transaction) => {
        const codeSnap = await transaction.get(codeRef);
        if (!codeSnap.exists()) throw new Error('Code gone');

        transaction.update(codeRef, { usageCount: increment(1) });

        // Award 100 AI credits to referrer
        const referrerRef = doc(db, 'users', data.userId);
        transaction.update(referrerRef, {
          [`usage.templateGeneration.remaining`]: increment(100),
          [`usage.templateGeneration.total`]: increment(100),
        });

        // Award 50 AI credits to new user
        const newUserRef = doc(db, 'users', newUserId);
        transaction.set(newUserRef, {
          [`usage.templateGeneration.remaining`]: increment(50),
          [`usage.templateGeneration.total`]: increment(50),
        }, { merge: true });
      });

      return { success: true, message: 'Referral applied! You both get bonus AI credits.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to apply referral' };
    }
  }
}
