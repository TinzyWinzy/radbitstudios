import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { adminDb } from '@/lib/firebase/firebase-admin';

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

async function verifyToken(token: string): Promise<{ uid: string } | null> {
  try {
    const JWKS = jose.createRemoteJWKSet(
      new URL('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'),
    );
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    return { uid: payload.sub as string };
  } catch {
    return null;
  }
}

function ensureDocId(uid: string, smeName: string): string {
  const enc = Buffer.from(`${uid}_${smeName}`).toString('base64').replace(/[/+=]/g, '_').slice(0, 80);
  return enc;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const verified = await verifyToken(token);
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
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { idToken, smeName, smeSector } = await req.json();
    if (!idToken || !smeName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const verified = await verifyToken(idToken);
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
}
