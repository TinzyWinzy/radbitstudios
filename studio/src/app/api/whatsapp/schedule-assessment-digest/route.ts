import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { enqueueOutboundMessage } from '@/services/whatsapp/outbound-queue';

export async function POST(req: NextRequest) {
  try {
    const { userId, idToken } = await req.json();
    if (!userId || !idToken) {
      return NextResponse.json({ error: 'Missing userId or idToken' }, { status: 400 });
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const phone = userData?.phone;
    if (!phone) {
      return NextResponse.json({ error: 'No phone number on file. Link WhatsApp in settings first.' }, { status: 400 });
    }

    const queueId = await enqueueOutboundMessage(
      userId,
      phone,
      'assessment_results_ready',
      { name: userData?.businessName || userData?.displayName || 'there' },
      30 * 60 * 1000,
    );

    return NextResponse.json({ queued: true, queueId, estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
