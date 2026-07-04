import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { partnerService } from '@/services/partner.service';
import { commissionService } from '@/services/commission.service';

export const GET = withIpRateLimit(
  { maxRequests: 30, windowMs: 60 * 1000, keyPrefix: 'ratelimit:partner-commission-list' },
  async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get('authorization');
      const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!idToken) {
        return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
      }

      const decoded = await getAuth(adminApp).verifyIdToken(idToken);
      const partner = await partnerService.getByUid(decoded.uid);
      if (!partner || !partner.id) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }

      const commissions = await commissionService.getByPartner(partner.id);
      return NextResponse.json({ commissions });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);
