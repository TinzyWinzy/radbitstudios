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

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const verified = await verifyToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userDoc = await adminDb.collection('users').doc(verified.uid).get();
    const userData = userDoc.data();
    const investorName = userData?.businessName || 'Investor';

    const interests = await adminDb.collection('diaspora_interests')
      .where('investorUid', '==', verified.uid)
      .get();

    const likedSmeNames = interests.docs.map(d => d.data().smeName as string);
    if (likedSmeNames.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const matches: { name: string; sector: string; status: string }[] = [];

    for (const smeName of likedSmeNames) {
      const smeSnap = await adminDb
        .collection('users')
        .where('businessName', '==', smeName)
        .limit(1)
        .get();

      if (smeSnap.empty) continue;
      const smeDoc = smeSnap.docs[0];
      const smeData = smeDoc.data();

      // Check if SME has also expressed interest in this investor (mutual)
      const smeInterests = await adminDb
        .collection('diaspora_interests')
        .where('investorUid', '==', smeDoc.id)
        .get();

      const smeLikesInvestor = smeInterests.docs.some(
        d => d.data().smeName === investorName,
      );

      matches.push({
        name: smeName,
        sector: smeData.industry || '',
        status: smeLikesInvestor ? 'Matched' : 'Pending',
      });
    }

    return NextResponse.json({ matches });
  } catch (error: unknown) {
    console.error('[Diaspora Matches] Error:', error);
    return NextResponse.json({ error: 'Failed to load matches' }, { status: 500 });
  }
}
