import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { enqueueOutboundMessage } from '@/services/whatsapp/outbound-queue';

const adminAuth = getAuth(adminApp);

export const POST = withIpRateLimit(
  { maxRequests: 5, windowMs: 60 * 1000, keyPrefix: 'ratelimit:schedule-digest' },
  async (req: NextRequest) => {
  try {
    const { userId, idToken } = await req.json();
    if (!userId || !idToken) {
      return NextResponse.json({ error: 'Missing userId or idToken' }, { status: 400 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Invalid idToken' }, { status: 401 });
    }
    if (decoded.uid !== userId) {
      return NextResponse.json({ error: 'userId mismatch' }, { status: 403 });
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
},
);
