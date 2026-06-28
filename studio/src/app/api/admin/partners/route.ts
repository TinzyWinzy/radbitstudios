import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp, adminDb } from '@/lib/firebase/firebase-admin';
import { partnerService } from '@/services/partner.service';
import { commissionService } from '@/services/commission.service';
import { payoutService } from '@/services/payout.service';
import { payoutOrchestrator } from '@/services/payout/payout-orchestrator';
import { approveCommission } from '@/services/commission-engine.service';

async function verifyAdmin(token: string): Promise<string | null> {
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const role = userDoc.data()?.role;
    if (role === 'admin' || role === 'super_admin') return decoded.uid;
    return null;
  } catch {
    return null;
  }
}

export const GET = async (req: NextRequest) => {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const uid = await verifyAdmin(token);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const partners = await partnerService.listAll();

  const enriched = await Promise.all(
    partners.map(async (p) => {
      const commissions = await commissionService.getByPartner(p.id!);
      const payouts = await payoutService.getByPartner(p.id!);
      return {
        ...p,
        commissions,
        payouts,
        pendingCommissionTotal: commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0),
        approvedCommissionTotal: commissions.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0),
      };
    })
  );

  return NextResponse.json({ partners: enriched });
};

export const POST = async (req: NextRequest) => {
  const { idToken, action, payload } = await req.json();
  if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 401 });

  const uid = await verifyAdmin(idToken);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  switch (action) {
    case 'approve-commission': {
      await approveCommission(payload.commissionId);
      return NextResponse.json({ success: true });
    }
    case 'process-payout': {
      const result = await payoutOrchestrator.processPayout(payload.payoutId);
      return NextResponse.json(result);
    }
    case 'process-all-payouts': {
      const summary = await payoutOrchestrator.processAllPending();
      return NextResponse.json({ success: true, summary });
    }
    case 'update-tier': {
      const tierConfig = (await import('@/services/tiers.service')).TIERS.find(t => t.tier === payload.tier);
      if (!tierConfig) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      await partnerService.update(payload.partnerId, { tier: payload.tier, commissionRate: tierConfig.rate });
      return NextResponse.json({ success: true, tier: payload.tier, rate: tierConfig.rate });
    }
    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
};
