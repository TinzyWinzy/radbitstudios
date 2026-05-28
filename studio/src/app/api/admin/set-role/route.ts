import { NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { validateBody, SetRoleSchema } from '@/lib/api-validation';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const idToken = authHeader.slice(7);
    const adminAuth = getAuth(adminApp);

    const decoded = await adminAuth.verifyIdToken(idToken);
    const callerUid = decoded.uid;

    const callerDoc = await getFirestore(adminApp).collection('users').doc(callerUid).get();
    const callerData = callerDoc.data();
    if (!callerData || (callerData.role !== 'admin' && callerData.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
    }

    const validation = await validateBody(request, SetRoleSchema);
    if (!validation.success) return validation.response;

    const { uid, role } = validation.data;

    await adminAuth.setCustomUserClaims(uid, { role });
    await getFirestore(adminApp).collection('users').doc(uid).set({ role }, { merge: true });

    return NextResponse.json({ success: true, uid, role });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API /api/admin/set-role] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
