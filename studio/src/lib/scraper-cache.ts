import { checkUpstashRateLimit } from '@/lib/upstash-ratelimit';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function invalidateCache(keyPattern?: string): void {
  if (!keyPattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(keyPattern)) cache.delete(key);
  }
}

export function cacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}

const DEFAULT_LIMITS: Record<string, { maxRequests: number; window: string }> = {
  default: { maxRequests: 10, window: '60 s' },
  rss: { maxRequests: 5, window: '60 s' },
  api: { maxRequests: 30, window: '60 s' },
  tender: { maxRequests: 3, window: '60 s' },
  newsScrape: { maxRequests: 1, window: '4 h' },
};

export async function checkRateLimit(key: string, limitType = 'default'): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  const config = DEFAULT_LIMITS[limitType] || DEFAULT_LIMITS.default;
  const result = await checkUpstashRateLimit(
    `scraper:${limitType}:${key}`,
    config.maxRequests,
    config.window,
  );
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetIn: Math.ceil(result.reset / 1000),
  };
}

export async function withRateLimit<T>(
  key: string,
  limitType: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  const { allowed, resetIn } = await checkRateLimit(key, limitType);
  if (!allowed) {
    console.warn(`[RateLimit] Blocked: ${key}. Resets in ${resetIn}s`);
    return fallback;
  }
  return fn();
}

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) return cached;
  const data = await fn();
  setCached(key, data, ttlMs);
  return data;
}
