import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/api-auth';
import { subscribeToWhatsAppBriefs, unsubscribeFromWhatsAppBriefs } from '@/services/daily-brief-service';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { phoneNumber, frequency } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'phoneNumber required' }, { status: 400 });
    }

    const result = await subscribeToWhatsAppBriefs(verified.uid, phoneNumber, frequency || 'daily');
    return NextResponse.json({ success: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await unsubscribeFromWhatsAppBriefs(verified.uid);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
