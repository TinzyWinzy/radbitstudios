import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { attributeClient } from '@/services/attribution.service';

export const POST = withIpRateLimit(
  { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:partner-attribute' },
  async (req: NextRequest) => {
    try {
      const { idToken, refCode } = await req.json();

      if (!idToken || !refCode) {
        return NextResponse.json({ error: 'Missing idToken or refCode' }, { status: 400 });
      }

      const decoded = await getAuth(adminApp).verifyIdToken(idToken);
      const clientId = decoded.uid;

      const referralId = await attributeClient(clientId, refCode);

      if (!referralId) {
        return NextResponse.json({ attributed: false });
      }

      return NextResponse.json({ attributed: true, referralId });
    } catch (error: unknown) {
      console.error('[Partner Attribute] Error:', error);
      return NextResponse.json({ error: 'Attribution failed' }, { status: 500 });
    }
  },
);
