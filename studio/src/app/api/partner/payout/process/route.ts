import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp, adminDb } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { payoutOrchestrator } from '@/services/payout/payout-orchestrator';
import { payoutService } from '@/services/payout.service';

export const POST = withIpRateLimit(
  { maxRequests: 10, windowMs: 60 * 1000, keyPrefix: 'ratelimit:payout-process' },
  async (req: NextRequest) => {
    try {
      const { idToken, payoutId } = await req.json();

      if (!idToken) {
        return NextResponse.json({ error: 'Missing idToken' }, { status: 401 });
      }

      const decoded = await getAuth(adminApp).verifyIdToken(idToken);

      // Admin-only
      const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
      const userData = userDoc.data();
      if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (payoutId) {
        // Process a single payout
        const result = await payoutOrchestrator.processPayout(payoutId);
        if (result.success) {
          return NextResponse.json({ success: true, message: 'Payout processed' });
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      // Process all pending payouts
      const summary = await payoutOrchestrator.processAllPending();
      return NextResponse.json({ success: true, summary });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);

export const GET = withIpRateLimit(
  { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:payout-list' },
  async (req: NextRequest) => {
    try {
      const token = req.nextUrl.searchParams.get('token');
      if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 401 });
      }

      const decoded = await getAuth(adminApp).verifyIdToken(token);
      const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
      const userData = userDoc.data();

      if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const status = req.nextUrl.searchParams.get('status') as any;
      const payouts = status
        ? await payoutService.getByStatus(status)
        : await payoutService.getPending();

      return NextResponse.json({ payouts });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);
