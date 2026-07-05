import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/api-auth';
import { recordAssetMaintenance, getAssetHealth } from '@/services/operational-mirror';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const assets = await getAssetHealth(verified.uid);
    return NextResponse.json({ count: assets.length, assets });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { assetName, assetType, status, nextMaintenanceDue, notes } = body;
    if (!assetName || !assetType || !nextMaintenanceDue) {
      return NextResponse.json({ error: 'assetName, assetType, and nextMaintenanceDue required' }, { status: 400 });
    }
    if (!['operational', 'maintenance', 'broken', 'decommissioned'].includes(status)) {
      return NextResponse.json({ error: 'status must be operational, maintenance, broken, or decommissioned' }, { status: 400 });
    }

    const record = await recordAssetMaintenance(verified.uid, assetName, assetType, status, nextMaintenanceDue, notes);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
