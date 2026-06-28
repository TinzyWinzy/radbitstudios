import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { partnerService } from '@/services/partner.service';
import { payoutService } from '@/services/payout.service';
import { commissionService } from '@/services/commission.service';

export const POST = withIpRateLimit(
  { maxRequests: 5, windowMs: 60 * 1000, keyPrefix: 'ratelimit:partner-payout' },
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { idToken, method, recipient } = body;

      if (!idToken) {
        return NextResponse.json({ error: 'Missing idToken' }, { status: 401 });
      }
      if (!method || !['ecocash', 'bank', 'crypto'].includes(method)) {
        return NextResponse.json({ error: 'Invalid payout method' }, { status: 400 });
      }
      if (method === 'ecocash' && !recipient) {
        return NextResponse.json({ error: 'Phone number required for EcoCash payouts' }, { status: 400 });
      }

      const decoded = await getAuth(adminApp).verifyIdToken(idToken);
      const partner = await partnerService.getByUid(decoded.uid);
      if (!partner || !partner.id) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }
      if (partner.status !== 'active') {
        return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
      }

      const approvedCommissions = await commissionService.getByPartnerAndStatus(partner.id, 'approved');
      if (approvedCommissions.length === 0) {
        return NextResponse.json({ error: 'No approved commissions to withdraw' }, { status: 400 });
      }

      const totalAmount = approvedCommissions.reduce((sum, c) => sum + c.amount, 0);
      const commissionIds = approvedCommissions.map(c => c.id!).filter(Boolean);

      const payoutId = await payoutService.create({
        partnerId: partner.id,
        amount: totalAmount,
        commissionIds,
        method: method as 'ecocash' | 'bank' | 'crypto',
        recipient: recipient?.trim() || partner.phone || undefined,
        currency: 'USD',
      });

      for (const id of commissionIds) {
        await commissionService.updateStatus(id, 'paid');
      }
      await partnerService.update(partner.id, { totalPaid: (partner.totalPaid || 0) + totalAmount });

      return NextResponse.json({ success: true, payoutId, amount: totalAmount });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);
