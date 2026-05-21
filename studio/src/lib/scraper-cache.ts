// Simple in-memory cache with TTL for server-side scraping
// In production, use Redis or Firestore for cross-instance cache

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

// ─── Rate limiter for external API calls ────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  default: { maxRequests: 10, windowMs: 60_000 },
  rss: { maxRequests: 5, windowMs: 60_000 },
  api: { maxRequests: 30, windowMs: 60_000 },
  tender: { maxRequests: 3, windowMs: 60_000 },
  newsScrape: { maxRequests: 1, windowMs: 4 * 60 * 60 * 1000 },
};

export function checkRateLimit(key: string, limitType = 'default'): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const config = DEFAULT_LIMITS[limitType] || DEFAULT_LIMITS.default;
  const now = Date.now();

  let entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowMs };
  }

  entry.count++;
  rateLimits.set(key, entry);

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);

  if (!allowed) {
    console.warn(`[RateLimit] ${key} exceeded. Reset in ${resetIn}s`);
  }

  return { allowed, remaining, resetIn };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimits.entries()) {
    if (now > v.resetAt + 60_000) rateLimits.delete(k);
  }
  for (const [k, v] of cache.entries()) {
    if (now > v.expiresAt) cache.delete(k);
  }
}, 300_000);

export async function withRateLimit<T>(
  key: string,
  limitType: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  const { allowed, resetIn } = checkRateLimit(key, limitType);
  if (!allowed) {
    console.warn(`[RateLimit] Blocked: ${key}. Resets in ${resetIn}s`);
    return fallback;
  }
  return fn();
}

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) return cached;
  const data = await fn();
  setCached(key, data, ttlMs);
  return data;
}