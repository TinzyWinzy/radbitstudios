import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp, adminDb } from '@/lib/firebase/firebase-admin';
import { TIERS, getNextTier } from '@/services/tiers.service';
import { partnerService } from '@/services/partner.service';

export const GET = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ tiers: TIERS });
    }

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const partner = await partnerService.getByUid(decoded.uid);
    if (!partner) {
      return NextResponse.json({ tiers: TIERS });
    }

    const nextTier = getNextTier(partner.tier);

    return NextResponse.json({
      currentTier: partner.tier,
      commissionRate: partner.commissionRate,
      clientCount: partner.clientCount,
      nextTier,
      tiers: TIERS,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const { partnerId, tier } = await req.json();

    if (!token || !partnerId || !tier) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const tierConfig = TIERS.find(t => t.tier === tier);
    if (!tierConfig) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    await partnerService.update(partnerId, {
      tier,
      commissionRate: tierConfig.rate,
    });

    return NextResponse.json({ success: true, tier, rate: tierConfig.rate });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
