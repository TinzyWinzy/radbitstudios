import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { ReferralService } from '@/services/referral.service';

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
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const verified = await verifyToken(idToken);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const service = new ReferralService();
    const code = await service.generateCode(verified.uid);

    return NextResponse.json({ success: true, code });
  } catch (error: any) {
    console.error('[Referral Generate] Error:', error);
    return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
  }
}
