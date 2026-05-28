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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { idToken, countryOfResidence, maxTicketSize, targetSectors } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const verified = await verifyToken(idToken);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!countryOfResidence || !maxTicketSize || !targetSectors?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: countryOfResidence, maxTicketSize, targetSectors' },
        { status: 400 },
      );
    }

    await adminDb.collection('diaspora_investors').doc(verified.uid).set(
      {
        countryOfResidence,
        maxTicketSize,
        targetSectors,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true, message: 'Profile saved' });
  } catch (error: unknown) {
    console.error('[Diaspora Profile] Error:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
