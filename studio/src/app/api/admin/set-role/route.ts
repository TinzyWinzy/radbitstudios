import { NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { validateBody, SetRoleSchema } from '@/lib/api-validation';
import { withRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

export const POST = withRateLimit(
  RateLimits.mutation,
  (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    return `ip:${ip}`;
  },
  async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const idToken = authHeader.slice(7);
    const adminAuth = getAuth(adminApp);

    const decoded = await adminAuth.verifyIdToken(idToken);
    if (decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: super-admin claim required' }, { status: 403 });
    }

    const validation = await validateBody(request, SetRoleSchema);
    if (!validation.success) return validation.response;

    const { uid, role } = validation.data;

    const target = await adminAuth.getUser(uid);
    await adminAuth.setCustomUserClaims(uid, { ...target.customClaims, role });
    await adminAuth.revokeRefreshTokens(uid);
    await getFirestore(adminApp).collection('users').doc(uid).set({ role }, { merge: true });

    return NextResponse.json({ success: true, uid, role });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API /api/admin/set-role] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
},
);
