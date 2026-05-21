import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

const adminAuth = getAuth(adminApp);

/**
 * POST /api/auth/refresh-session
 *
 * Verifies the Firebase ID token, then sets it as a session cookie.
 * Rate-limit: 60 req/hour per IP — brute-force backstop.
 */
export const POST = withIpRateLimit(
  RateLimits.sessionRefresh,
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { idToken, expiresIn = 3600 } = await req.json();

      if (!idToken) {
        return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
      }

      const decoded = await adminAuth.verifyIdToken(idToken);
      const uid = decoded.uid;

      const response = NextResponse.json({ success: true, uid });

      response.cookies.set('__session', idToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expiresIn,
      });

      return response;
    } catch (error: any) {
      if (error?.status === 429) throw error;
      if (error?.code?.includes('auth/')) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      console.error('Refresh session error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
);
