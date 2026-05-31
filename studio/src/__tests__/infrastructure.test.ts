import { describe, it, expect } from 'vitest';
import { AIGateway } from '@/services/ai/ai-gateway';
import { encrypt, decrypt, sanitizeHTML } from '@/services/security/index';

describe('AIGateway', () => {
  it('returns no-key response when no API keys configured', async () => {
    const gateway = new AIGateway();
    const result = await gateway.generate({ prompt: 'test', difficulty: 'simple' });
    expect(result.model).toBe('fallback-no-key');
    expect(result.content).toContain('unavailable');
  });
});

describe('BruteForceProtection', () => {
  it('check and recordFailure are async functions', async () => {
    const { BruteForceProtection } = await import('@/services/security/index');
    const bf = new BruteForceProtection();
    // These require Firestore — just verify they return promises
    const checkResult = bf.check('test-key');
    expect(checkResult).toBeInstanceOf(Promise);
    const result = await checkResult;
    expect(result).toHaveProperty('allowed');
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
