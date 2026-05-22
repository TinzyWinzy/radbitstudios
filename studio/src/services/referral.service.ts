import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface ReferralCode {
  code: string;
  userId: string;
  usageCount: number;
  createdAt: Date;
}

export interface PartnerCode {
  code: string;
  partnerName: string;
  partnerType: 'smeaz' | 'zncc' | 'czi' | 'tech_hub' | 'other';
  discountPercent: number;
  usageCount: number;
  maxUses: number;
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

  async applyReferral(referralCode: string, newUserId: string): Promise<{ success: boolean; message: string; discountPercent?: number }> {
    // Check partner codes first
    const partnerDoc = await adminDb.doc(`partner_codes/${referralCode}`).get();
    if (partnerDoc.exists) {
      const partner = partnerDoc.data() as PartnerCode;
      if (partner.usageCount >= partner.maxUses) {
        return { success: false, message: 'This partner code has reached its usage limit.' };
      }

      await adminDb.runTransaction(async (transaction) => {
        transaction.update(adminDb.doc(`partner_codes/${referralCode}`), {
          usageCount: FieldValue.increment(1),
        });

        // Mark user as referred by partner (discount applied at checkout)
        transaction.set(adminDb.doc(`users/${newUserId}`), {
          partnerCode: referralCode,
          partnerName: partner.partnerName,
          partnerDiscount: partner.discountPercent,
        }, { merge: true });
      });

      return {
        success: true,
        message: `Welcome! You're part of the ${partner.partnerName} community. You get ${partner.discountPercent}% off any plan.`,
        discountPercent: partner.discountPercent,
      };
    }

    // Fall back to regular referral code
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

        const referrerRef = adminDb.doc(`users/${data.userId}`);
        transaction.update(referrerRef, {
          [`usage.templateGeneration.remaining`]: FieldValue.increment(100),
          [`usage.templateGeneration.total`]: FieldValue.increment(100),
        });

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

  async getPartnerCode(partnerName: string): Promise<PartnerCode | null> {
    const snap = await adminDb
      .collection('partner_codes')
      .where('partnerName', '==', partnerName)
      .where('partnerType', 'in', ['smeaz', 'zncc', 'czi'])
      .limit(1)
      .get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
  }

  async validatePartnerCode(code: string): Promise<{ valid: boolean; partner?: PartnerCode }> {
    const doc = await adminDb.doc(`partner_codes/${code}`).get();
    if (!doc.exists) return { valid: false };
    const partner = doc.data() as PartnerCode;
    if (partner.usageCount >= partner.maxUses) return { valid: false, partner };
    return { valid: true, partner };
  }
}
