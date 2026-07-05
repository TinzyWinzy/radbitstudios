import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/api-auth';
import { recordDeliveryCheckpoint, getRecentDeliveries } from '@/services/operational-mirror';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const deliveries = await getRecentDeliveries(verified.uid);
    return NextResponse.json({ count: deliveries.length, deliveries });
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
    const { destination, latitude, longitude, status, photoUrl } = body;
    if (!destination || latitude === undefined || longitude === undefined || !status) {
      return NextResponse.json({ error: 'destination, latitude, longitude, and status required' }, { status: 400 });
    }
    if (!['en_route', 'arrived', 'confirmed', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'status must be en_route, arrived, confirmed, or failed' }, { status: 400 });
    }

    const record = await recordDeliveryCheckpoint(verified.uid, destination, latitude, longitude, status, photoUrl);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
