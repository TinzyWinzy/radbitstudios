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
        const response = NextResponse.json({ success: true, cleared: true });
        response.cookies.set('__session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 0,
        });
        return response;
      }

      const { BruteForceProtection } = await import('@/services/security/index');
      const bruteForce = new BruteForceProtection();
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
      const bfCheck = await bruteForce.check(`refresh-session:${ip}`);
      if (!bfCheck.allowed) {
        return NextResponse.json(
          { error: `Too many attempts. Retry after ${bfCheck.retryAfter}s` },
          { status: 429 },
        );
      }

      let decoded;
      try {
        decoded = await adminAuth.verifyIdToken(idToken);
      } catch {
        await bruteForce.recordFailure(`refresh-session:${ip}`);
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }

      await bruteForce.reset(`refresh-session:${ip}`);
      const uid = decoded.uid;

      const response = NextResponse.json({ success: true, uid });

      // Set cookie maxAge 10 minutes longer than token expiry to avoid
      // the cookie expiring before the next refresh cycle fires.
      const cookieMaxAge = expiresIn + 600;

      response.cookies.set('__session', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: cookieMaxAge,
      });

      return response;
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      if (err?.status === 429) throw error;
      if (typeof err?.code === 'string' && err.code.includes('auth/')) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      console.error('Refresh session error:', error instanceof Error ? error.message : error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
);
