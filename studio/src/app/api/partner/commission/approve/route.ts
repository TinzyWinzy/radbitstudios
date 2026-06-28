import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp, adminDb } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { approveCommission } from '@/services/commission-engine.service';

export const POST = withIpRateLimit(
  { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:commission-approve' },
  async (req: NextRequest) => {
    try {
      const { idToken, commissionId } = await req.json();

      if (!idToken) {
        return NextResponse.json({ error: 'Missing idToken' }, { status: 401 });
      }
      if (!commissionId) {
        return NextResponse.json({ error: 'Missing commissionId' }, { status: 400 });
      }

      const decoded = await getAuth(adminApp).verifyIdToken(idToken);

      // Check admin role
      const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
      const userData = userDoc.data();
      if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      await approveCommission(commissionId);

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);
