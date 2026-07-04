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

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export const GET = async (req: NextRequest) => {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });

    const uid = await verifyAdmin(token);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { action, payload } = await req.json();
    if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 });

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
