import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';

type Duration = `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getRatelimit() {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s' as Duration),
    analytics: true,
    prefix: 'ratelimit',
  });
}

const defaultRatelimit = getRatelimit();

export async function checkUpstashRateLimit(
  identifier: string,
  maxRequests: number = 10,
  window: string = '10 s',
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  if (!defaultRatelimit) {
    return { allowed: true, remaining: 999, reset: 0 };
  }
  const rl = new Ratelimit({
    redis: getRedis()!,
    limiter: Ratelimit.slidingWindow(maxRequests, window as Duration),
    analytics: true,
    prefix: 'ratelimit',
  });
  const { success, remaining, reset } = await rl.limit(identifier);
  return { allowed: success, remaining, reset };
}

export async function withUpstashRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  options?: { maxRequests?: number; window?: string; getIdentifier?: (req: NextRequest) => string },
): Promise<NextResponse> {
  const identifier = options?.getIdentifier
    ? options.getIdentifier(req)
    : req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';

  const userId = req.cookies.get('__session')?.value;
  const effectiveId = userId || identifier;
  const maxReqs = userId ? (options?.maxRequests || 100) : (options?.maxRequests || 10);

  const { allowed, remaining, reset } = await checkUpstashRateLimit(effectiveId, maxReqs, options?.window || '10 s');

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil((reset - Date.now()) / 1000) },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Limit': String(maxReqs),
        },
      },
    );
  }

  const res = await handler();
  res.headers.set('X-RateLimit-Remaining', String(remaining));
  res.headers.set('X-RateLimit-Limit', String(maxReqs));
  return res;
}
