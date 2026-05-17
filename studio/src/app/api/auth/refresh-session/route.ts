import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

/**
 * POST /api/auth/refresh-session
 *
 * Refreshes the Firebase session cookie.
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

      const response = NextResponse.json({ success: true });

      response.cookies.set('__session', idToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expiresIn,
      });

      return response;
    } catch (error: any) {
      // Re-throw 429 from rate limiter
      if (error?.status === 429) throw error;
      console.error('Refresh session error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
);
