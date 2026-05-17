/**
 * API Route Rate-Limit Wrappers for Next.js App Router
 *
 * Usage:
 *   import { withRateLimit } from '@/services/api-rate-limit';
 *   import { RateLimits } from '@/services/rate-limiter';
 *
 *   export const POST = withRateLimit(
 *     RateLimits.authVerify,
 *     (req) => getRateLimitKey(req.headers),
 *     async (req) => { /* handler * / }
 *   );
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitKey, type RateLimitConfig } from './rate-limiter';

const RETRY_AFTER_HEADER = 'Retry-After';

function rateLimitResponse(result: { allowed: boolean; retryAfterSeconds?: number; limit: number }): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests', retryAfter: result.retryAfterSeconds ?? 60 },
    {
      status: 429,
      headers: {
        [RETRY_AFTER_HEADER]: String(result.retryAfterSeconds ?? 60),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}

/**
 * Rate-limit by an arbitrary key derived from the request.
 * keyFn: (req) => unique identifier string (IP, user ID, phone number…)
 */
export function withRateLimit(
  config: RateLimitConfig,
  keyFn: (req: NextRequest) => string,
  handler: (req: NextRequest) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rawKey = keyFn(req);
    const key = `${config.keyPrefix || 'rl'}:${rawKey}`;
    const result = await checkRateLimit(key, config);

    if (!result.allowed) {
      return rateLimitResponse(result);
    }

    return handler(req);
  };
}

/**
 * Rate-limit by client IP address only.
 */
export function withIpRateLimit(
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse> {
  return withRateLimit(
    config,
    (req) => getRateLimitKey(req.headers as any),
    handler,
  );
}

/**
 * Rate-limit by authenticated user ID, falling back to IP for anonymous requests.
 * Reads userId from the `__session` cookie.
 */
export function withUserRateLimit(
  config: RateLimitConfig,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    const userId = req.cookies.get('__session')?.value || '';
    const rawKey = userId ? `user:${userId}` : `ip:${getRateLimitKey(req.headers as any)}`;
    const key = `${config.keyPrefix || 'rl'}:${rawKey}`;
    const result = await checkRateLimit(key, config);

    if (!result.allowed) {
      return rateLimitResponse(result);
    }

    return handler(req, userId);
  };
}
