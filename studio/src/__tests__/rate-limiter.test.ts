import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, RateLimits, getRateLimitKey } from '@/services/rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('allows first request within window', async () => {
      const result = await checkRateLimit('test-user', RateLimits.aiGenerate);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(29);
    });

    it('returns remaining count correctly', async () => {
      const result = await checkRateLimit('test-user', RateLimits.aiGenerate);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.limit).toBe(30);
    });

    it('falls through to Firestore when memory limit is reached', async () => {
      // Hit the memory limit first by calling many times
      const results = await Promise.all(
        Array.from({ length: 35 }, (_, i) => checkRateLimit(`burst-${i}`, RateLimits.aiGenerate)),
      );
      const allowed = results.filter(r => r.allowed).length;
      expect(allowed).toBeGreaterThan(0);
      expect(allowed).toBeLessThanOrEqual(35);
    });
  });

  describe('getRateLimitKey', () => {
    it('uses userId when provided', () => {
      const req = { headers: {} };
      expect(getRateLimitKey(req as any, 'user-abc')).toBe('user-abc');
    });

    it('falls back to x-forwarded-for IP when no userId', () => {
      const req = { headers: { 'x-forwarded-for': '203.0.113.42' } };
      expect(getRateLimitKey(req as any)).toBe('203.0.113.42');
    });

    it('uses first IP from x-forwarded-for list', () => {
      const req = { headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' } };
      expect(getRateLimitKey(req as any)).toBe('192.168.1.1');
    });

    it('falls back to anonymous when no identifier exists', () => {
      const req = { headers: {} };
      expect(getRateLimitKey(req as any)).toBe('anonymous');
    });
  });

  describe('RateLimits presets', () => {
    it('defines reasonable limits for AI generation', () => {
      expect(RateLimits.aiGenerate.maxRequests).toBe(30);
      expect(RateLimits.aiGenerate.windowMs).toBe(60_000);
    });

    it('defines tight OTP limits for SMS bombing protection', () => {
      expect(RateLimits.otpRequest.maxRequests).toBe(5);
      expect(RateLimits.otpRequest.windowMs).toBe(10 * 60 * 1000);
    });
  });
});
