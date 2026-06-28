import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp, adminDb } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { partnerService } from '@/services/partner.service';

function validateBody(body: Record<string, unknown>): { success: boolean; error?: string } {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    return { success: false, error: 'Name must be at least 2 characters' };
  }
  return { success: true };
}

export const POST = withIpRateLimit(
  { maxRequests: 10, windowMs: 60 * 1000, keyPrefix: 'ratelimit:partner-signup' },
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validation = validateBody(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const { idToken, name, phone, partnerType, bio } = body;
      if (!idToken) {
        return NextResponse.json({ error: 'Missing idToken' }, { status: 401 });
      }

      const decoded = await getAuth(adminApp).verifyIdToken(idToken);
      const uid = decoded.uid;
      const email = decoded.email || '';

      const existing = await partnerService.getByUid(uid);
      if (existing) {
        return NextResponse.json({ error: 'Partner profile already exists' }, { status: 409 });
      }

      const partnerId = await partnerService.create({
        uid,
        name: name.trim(),
        email,
        phone: phone?.trim() || undefined,
        partnerType: partnerType?.trim() || undefined,
        bio: bio?.trim() || undefined,
      });

      await adminDb.collection('users').doc(uid).set({
        partnerId,
        partner: true,
        updatedAt: new Date(),
      }, { merge: true });

      return NextResponse.json({
        success: true,
        partnerId,
        referralCode: (await partnerService.getById(partnerId))?.referralCode,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);
