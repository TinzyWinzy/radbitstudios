import { checkUpstashRateLimit } from '@/lib/upstash-ratelimit';
import fs from 'fs';
import path from 'path';

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
  html: { maxRequests: 5, window: '60 s' },
  api: { maxRequests: 30, window: '60 s' },
  tender: { maxRequests: 3, window: '60 s' },
  newsScrape: { maxRequests: 1, window: '4 h' },
};

function parseWindow(window: string): number {
  const parts = window.split(' ');
  const value = parseInt(parts[0] || '1', 10);
  const unit = parts[1] || 's';
  switch (unit) {
    case 'ms': return value;
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return value * 1000;
  }
}

const rateLimitStore = new Map<string, number[]>();

function checkLocalRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const timestamps = rateLimitStore.get(key) || [];
  const recent = timestamps.filter(t => now - t < windowMs);
  const allowed = recent.length < maxRequests;
  if (allowed) {
    recent.push(now);
    rateLimitStore.set(key, recent);
  }
  const remaining = Math.max(0, maxRequests - recent.length);
  const resetIn = recent.length > 0 ? Math.ceil((windowMs - (now - recent[0])) / 1000) : 0;
  return { allowed, remaining, resetIn };
}

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

  // If Upstash is available (not no-op), use its result
  if (result.allowed === false || result.remaining < 999) {
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetIn: Math.ceil(result.reset / 1000),
    };
  }

  // Fallback: in-memory rate limiting when Upstash Redis is not configured
  return checkLocalRateLimit(key, config.maxRequests, parseWindow(config.window));
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

const SCRAPE_TRACKER_FILE = path.join(process.cwd(), 'data', 'scrape-tracker.json');

interface ScrapeTracker {
  [sourceKey: string]: {
    lastScrapedAt: string;
    itemCount: number;
    success: boolean;
  };
}

function loadScrapeTracker(): ScrapeTracker {
  try {
    if (fs.existsSync(SCRAPE_TRACKER_FILE)) {
      return JSON.parse(fs.readFileSync(SCRAPE_TRACKER_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {};
}

function saveScrapeTracker(tracker: ScrapeTracker): void {
  try {
    const dir = path.dirname(SCRAPE_TRACKER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SCRAPE_TRACKER_FILE, JSON.stringify(tracker, null, 2), 'utf-8');
  } catch { /* ignore */ }
}

export function shouldScrapeSource(sourceKey: string, minIntervalMs: number): boolean {
  const tracker = loadScrapeTracker();
  const entry = tracker[sourceKey];
  if (!entry) return true;
  const elapsed = Date.now() - new Date(entry.lastScrapedAt).getTime();
  return elapsed >= minIntervalMs;
}

export function recordScrapeAttempt(sourceKey: string, itemCount: number, success: boolean): void {
  const tracker = loadScrapeTracker();
  tracker[sourceKey] = {
    lastScrapedAt: new Date().toISOString(),
    itemCount,
    success,
  };
  saveScrapeTracker(tracker);
}
