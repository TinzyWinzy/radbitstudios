import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { verifyIdToken } from '@/lib/api-auth';

function ensureDocId(uid: string, smeName: string): string {
  const enc = Buffer.from(`${uid}_${smeName}`).toString('base64').replace(/[/+=]/g, '_').slice(0, 80);
  return enc;
}

const rlRead = { maxRequests: 60, windowMs: 60 * 1000, keyPrefix: 'ratelimit:diaspora-interest' };
const rlWrite = { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:diaspora-interest-write' };

export const GET = withIpRateLimit(rlRead, async (req: NextRequest): Promise<NextResponse> => {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const snap = await adminDb
      .collection('diaspora_interests')
      .where('investorUid', '==', verified.uid)
      .get();

    const interests = snap.docs.map(d => ({
      id: d.id,
      smeName: d.data().smeName,
      smeSector: d.data().smeSector,
      createdAt: d.data().createdAt,
    }));

    return NextResponse.json({ interests });
  } catch (error: unknown) {
    console.error('[Diaspora Interest GET] Error:', error);
    return NextResponse.json({ error: 'Failed to load interests' }, { status: 500 });
  }
});

export const POST = withIpRateLimit(rlWrite, async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { idToken, smeName, smeSector } = await req.json();
    if (!idToken || !smeName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const verified = await verifyIdToken(idToken);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const docId = ensureDocId(verified.uid, smeName);
    const existing = await adminDb.collection('diaspora_interests').doc(docId).get();

    if (existing.exists) {
      await adminDb.collection('diaspora_interests').doc(docId).delete();
      return NextResponse.json({ success: true, action: 'removed' });
    }

    await adminDb.collection('diaspora_interests').doc(docId).set({
      investorUid: verified.uid,
      smeName,
      smeSector: smeSector || '',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, action: 'added' });
  } catch (error: unknown) {
    console.error('[Diaspora Interest POST] Error:', error);
    return NextResponse.json({ error: 'Failed to save interest' }, { status: 500 });
  }
});
