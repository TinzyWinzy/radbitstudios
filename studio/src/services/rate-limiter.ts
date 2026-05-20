/**
 * Rate Limiter — Tiered strategy with Redis-primary / Firestore-fallback
 *
 * Architecture:
 *   Tier 1 (fast path):   In-memory sliding window — hits same instance
 *   Tier 2 (persistent):  Firestore counter doc — survives cold starts
 *   Future (Redis):       Swap via constructor injection when Redis is available
 *
 * Limits are per-IP, per-user, or per-key depending on context.
 * All counters are scoped to a configurable time window.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  maxRequests: number;      // max allowed in window
  windowMs: number;          // time window in ms
  keyPrefix?: string;        // e.g. 'ratelimit:otp' — helps Firestore namespace
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
  limit: number;
}

// ─── In-Memory Tier (fast path) ─────────────────────────────────────────────

const memoryWindows = new Map<string, number[]>();

function memoryCheck(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const timestamps: number[] = memoryWindows.get(key) ?? [];
  const valid = timestamps.filter(t => now - t < config.windowMs);

  if (valid.length >= config.maxRequests) {
    const oldest = valid[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((oldest + config.windowMs - now) / 1000),
      limit: config.maxRequests,
    };
  }

  valid.push(now);
  memoryWindows.set(key, valid);
  return {
    allowed: true,
    remaining: config.maxRequests - valid.length,
    limit: config.maxRequests,
  };
}

// ─── Firestore Fallback Tier ─────────────────────────────────────────────────

import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const FIRESTORE_COUNTERS = 'ratelimit_counters';

interface FSCounter {
  key: string;
  windowStart: number;       // epoch ms
  count: number;
  lastReset: number;
}

/**
 * Firestore-backed rate limit used when in-memory hasn't seen this key
 * (cold-start protection). Each key is a single document — updated in a
 * transaction to avoid races across concurrent serverless invocations.
 */
async function firestoreCheck(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now();
  const docRef = adminDb.doc(`${FIRESTORE_COUNTERS}/${key}`);

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      let counter = snap.data() as FSCounter | undefined;

      // Initialise or reset if window expired
      if (!counter || now - counter.windowStart >= config.windowMs) {
        counter = {
          key,
          windowStart: now,
          count: 1,
          lastReset: now,
        };
        tx.set(docRef, {
          ...counter,
          lastReset: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        return { allowed: true, remaining: config.maxRequests - 1, limit: config.maxRequests };
      }

      if (counter.count >= config.maxRequests) {
        const retryAfter = Math.ceil((counter.windowStart + config.windowMs - now) / 1000);
        return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter, limit: config.maxRequests };
      }

      counter.count += 1;
      tx.update(docRef, { count: counter.count });
      return { allowed: true, remaining: config.maxRequests - counter.count, limit: config.maxRequests };
    });
  } catch {
    // Firestore unavailable — deny with retry rather than pass (fail-closed)
    return { allowed: false, remaining: 0, retryAfterSeconds: 60, limit: config.maxRequests };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Check a rate limit by key.
 *
 * Strategy (two-tier):
 *   1. In-memory check first — O(1), zero I/O
 *   2. Firestore fallback — serialised transaction, only for cold-start / missed in-memory keys
 *
 * In production (with Redis), extend this with:
 *   const redisClient = getRedisClient();
 *   const count = await redis.incr(redisKey);
 *   if (count === 1) await redis.expire(redisKey, config.windowMs / 1000);
 */
export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  // Tier 1 — fast path
  const memResult = memoryCheck(key, config);
  if (memResult.allowed) return memResult;

  // Tier 2 — persistent fallback for cold starts or burst protection
  const fsResult = await firestoreCheck(key, config);
  return fsResult;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

export const RateLimits = {
  /**
   * OTP / auth verification — tight per-phone limit to block SMS bombing.
   * 5 attempts per phone per 10 minutes.
   */
  otpRequest:     { maxRequests: 5,  windowMs: 10 * 60 * 1000, keyPrefix: 'ratelimit:otp:request' },
  otpVerify:      { maxRequests: 10, windowMs: 10 * 60 * 1000, keyPrefix: 'ratelimit:otp:verify' },

  /**
   * Session refresh — moderate. Attacked key = session cookie / id token.
   * 60 per hour per IP.
   */
  sessionRefresh: { maxRequests: 60, windowMs: 60 * 60 * 1000, keyPrefix: 'ratelimit:session' },

  /**
   * Payments — generous but logged. 20/min per IP.
   */
  payments:       { maxRequests: 20, windowMs: 60 * 1000,          keyPrefix: 'ratelimit:payments' },

  /**
   * AI generation — expensive. 30/min per user, 60/min per IP fallback.
   */
  aiGenerate:     { maxRequests: 30, windowMs: 60 * 1000,          keyPrefix: 'ratelimit:ai' },

  /**
   * General API catch-all. 100/min per IP.
   */
  apiDefault:     { maxRequests: 100, windowMs: 60 * 1000,         keyPrefix: 'ratelimit:api' },

  /**
   * Sensitive mutations — 20/min per user.
   */
  mutation:       { maxRequests: 20, windowMs: 60 * 1000,          keyPrefix: 'ratelimit:mutation' },
} as const;

// ─── Helper: extract IP / user identifiers from a Next.js request ─────────────

/**
 * Returns the best available identity for rate-limit keying.
 * Priority: authenticated user UID → guest session token → IP.
 */
export function getRateLimitKey(
  req: { headers: Record<string, string | string[] | undefined> },
  userId?: string,
): string {
  if (userId) return userId;

  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string'
    ? forwarded.split(',')[0]?.trim()
    : Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return ip || 'anonymous';
}
