import { describe, it, expect } from 'vitest';
import { AIGateway } from '@/services/ai/ai-gateway';
import { BruteForceProtection, encrypt, decrypt, sanitizeHTML } from '@/services/security/index';

describe('AIGateway', () => {
  it('returns fallback response when no API keys configured', async () => {
    const gateway = new AIGateway();
    const result = await gateway.generate({ prompt: 'test', difficulty: 'simple' });
    expect(result.model).toBe('fallback');
    expect(result.content).toContain('unavailable');
  });

  it('respects user budget limits', async () => {
    const gateway = new AIGateway();
    gateway.setUserBudget('user-1', 0);
    const result = await gateway.generate({ prompt: 'test', userId: 'user-1' });
    expect(result.model).toBe('budget-limit');
  });
});

describe('BruteForceProtection', () => {
  it('allows first attempt', () => {
    const bf = new BruteForceProtection();
    expect(bf.check('test-key').allowed).toBe(true);
  });

  it('locks after 5 failures', () => {
    const bf = new BruteForceProtection();
    for (let i = 0; i < 5; i++) bf.recordFailure('test-key');
    const result = bf.recordFailure('test-key');
    expect(result.locked).toBe(true);
    expect(bf.check('test-key').allowed).toBe(false);
  });

  it('resets on successful attempt', () => {
    const bf = new BruteForceProtection();
    for (let i = 0; i < 5; i++) bf.recordFailure('test-key');
    bf.reset('test-key');
    expect(bf.check('test-key').allowed).toBe(true);
  });
});

describe('PII Encryption', () => {
  it('encrypts and decrypts a value', () => {
    const original = '+263771234567';
    const encoded = encrypt(original);
    expect(encoded).not.toBe(original);
    const decoded = decrypt(encoded);
    expect(decoded).toBe(original);
  });

  it('returns null for invalid ciphertext', () => {
    expect(decrypt('invalid')).toBeNull();
  });
});

describe('sanitizeHTML', () => {
  it('escapes HTML special characters', () => {
    expect(sanitizeHTML('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('passes safe text through', () => {
    expect(sanitizeHTML('Hello, world!')).toBe('Hello, world!');
  });
});
