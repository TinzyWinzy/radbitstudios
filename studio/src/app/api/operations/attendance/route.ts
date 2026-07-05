import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/api-auth';
import { clockIn, clockOut, getTimesheet } from '@/services/operational-mirror';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const from = request.nextUrl.searchParams.get('from') || undefined;
    const to = request.nextUrl.searchParams.get('to') || undefined;
    const records = await getTimesheet(verified.uid, from, to);
    return NextResponse.json({ count: records.length, records });
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
    const { action, employeeName, method, gpsLatitude, gpsLongitude } = body;
    if (!employeeName) {
      return NextResponse.json({ error: 'employeeName required' }, { status: 400 });
    }

    if (action === 'clock_out') {
      const record = await clockOut(verified.uid, employeeName);
      if (!record) return NextResponse.json({ error: `${employeeName} is not clocked in` }, { status: 400 });
      return NextResponse.json({ success: true, record });
    }

    if (action !== 'clock_in') {
      return NextResponse.json({ error: 'action must be clock_in or clock_out' }, { status: 400 });
    }

    const record = await clockIn(verified.uid, employeeName, method || 'manual', gpsLatitude, gpsLongitude);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
