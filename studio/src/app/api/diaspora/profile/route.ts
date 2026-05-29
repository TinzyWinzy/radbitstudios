import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { DiasporaProfileSchema } from '@/lib/api-validation';

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const doc = await adminDb.collection('diaspora_investors').doc(verified.uid).get();
    if (!doc.exists) {
      return NextResponse.json({ profile: null });
    }

    const data = doc.data();
    return NextResponse.json({
      profile: {
        countryOfResidence: data?.countryOfResidence || '',
        maxTicketSize: data?.maxTicketSize || '',
        targetSectors: data?.targetSectors || [],
      },
    });
  } catch (error: unknown) {
    console.error('[Diaspora Profile GET] Error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsed = DiasporaProfileSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { error: `Validation: ${firstError.path.join('.')} — ${firstError.message}` },
        { status: 400 },
      );
    }

    const { idToken, countryOfResidence, maxTicketSize, targetSectors } = parsed.data;

    const verified = await verifyToken(idToken);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await adminDb.collection('diaspora_investors').doc(verified.uid).set(
      {
        countryOfResidence,
        maxTicketSize,
        targetSectors,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true, message: 'Profile saved' });
  } catch (error: unknown) {
    console.error('[Diaspora Profile POST] Error:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
