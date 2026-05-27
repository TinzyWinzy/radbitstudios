import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import * as jose from 'jose';

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

async function verifyToken(token: string): Promise<{ uid: string } | null> {
  try {
    const JWKS = jose.createRemoteJWKSet(
      new URL(`https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`),
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

const USER_COLLECTIONS = [
  'assessments',
  'generations',
  'budgets',
  'bookmarks',
  'conversations',
  'messages',
  'notifications',
];

async function exportUserData(uid: string): Promise<Record<string, any>> {
  const data: Record<string, any> = {
    exportedAt: new Date().toISOString(),
    userId: uid,
  };

  for (const col of USER_COLLECTIONS) {
    try {
      const snap = await adminDb.collection(col).where('userId', '==', uid).get();
      data[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      data[col] = [];
    }
  }

  try {
    const userDoc = await adminDb.doc(`users/${uid}`).get();
    data.profile = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
  } catch {
    data.profile = null;
  }

  return data;
}

async function deleteUserData(uid: string): Promise<string[]> {
  const deleted: string[] = [];

  for (const col of USER_COLLECTIONS) {
    try {
      const snap = await adminDb.collection(col).where('userId', '==', uid).get();
      if (snap.empty) continue;

      const batch = adminDb.batch();
      snap.forEach(docSnap => batch.delete(adminDb.doc(`${col}/${docSnap.id}`)));
      await batch.commit();
      deleted.push(`${col}: ${snap.size} docs`);
    } catch (err) {
      console.warn(`[DeleteAccount] Error deleting ${col}:`, err);
      deleted.push(`${col}: error`);
    }
  }

  try {
    const userDocRef = adminDb.doc(`users/${uid}`);
    const batch = adminDb.batch();
    batch.delete(userDocRef);
    await batch.commit();
    deleted.push('users: 1 doc');
  } catch (err) {
    console.warn('[DeleteAccount] Error deleting user doc:', err);
    deleted.push('users: error');
  }

  return deleted;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { idToken, exportOnly } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const verified = await verifyToken(idToken);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { uid } = verified;

    if (exportOnly) {
      const data = await exportUserData(uid);
      return NextResponse.json({ success: true, data });
    }

    const deleted = await deleteUserData(uid);

    const response = NextResponse.json({
      success: true,
      deleted,
      message: 'Your account data has been deleted. You will be signed out.',
    });

    response.cookies.set('__session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error('[DeleteAccount] Error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
