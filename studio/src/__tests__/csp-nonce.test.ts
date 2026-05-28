import { describe, it, expect } from 'vitest';
import { generateNonce, buildCspWithNonce } from '@/lib/csp-nonce';

describe('CSP Nonce', () => {
  describe('generateNonce', () => {
    it('should return a base64 string', () => {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should return unique values on each call', () => {
      const nonces = new Set(Array.from({ length: 100 }, () => generateNonce()));
      expect(nonces.size).toBe(100);
    });

    it('should return 24 characters (16 bytes base64)', () => {
      const nonce = generateNonce();
      expect(nonce.length).toBe(24);
    });
  });

  describe('buildCspWithNonce', () => {
    it('should include nonce in script-src', () => {
      const nonce = 'test-nonce-123';
      const csp = buildCspWithNonce(nonce);
      expect(csp).toContain(`'nonce-${nonce}'`);
    });

    it('should include strict-dynamic', () => {
      const csp = buildCspWithNonce('test');
      expect(csp).toContain("'strict-dynamic'");
    });

    it('should not include unsafe-inline in script-src', () => {
      const csp = buildCspWithNonce('test');
      // unsafe-inline should only be in style-src, not script-src
      const scriptSrc = csp.split(';').find(s => s.trim().startsWith('script-src'));
      expect(scriptSrc).not.toContain("'unsafe-inline'");
    });

    it('should keep unsafe-inline in style-src', () => {
      const csp = buildCspWithNonce('test');
      const styleSrc = csp.split(';').find(s => s.trim().startsWith('style-src'));
      expect(styleSrc).toContain("'unsafe-inline'");
    });

    it('should include all required directives', () => {
      const csp = buildCspWithNonce('test');
      const directives = [
        'default-src', 'script-src', 'style-src', 'img-src', 'font-src',
        'connect-src', 'frame-src', 'frame-ancestors', 'object-src',
        'base-uri', 'form-action',
      ];
      for (const directive of directives) {
        expect(csp).toContain(directive);
      }
    });
  });
});
