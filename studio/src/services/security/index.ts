// Security utilities — JWT, rate limiting, brute force protection

import crypto from 'crypto';

// ============================================
// JWT Utilities
// ============================================

export interface JWTClaims {
  sub: string;
  role: 'sme_owner' | 'sme_staff' | 'admin';
  country: string;
  iat: number;
  exp: number;
}

export function createJWT(payload: Omit<JWTClaims, 'iat' | 'exp'>, secret: string, expiresInMin = 15): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const claims: JWTClaims = { ...payload, iat: now, exp: now + expiresInMin * 60 };
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyJWT(token: string, secret: string): JWTClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const signature = crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest('base64url');
    if (signature !== parts[2]) return null;
    const claims: JWTClaims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

export function createRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

// ============================================
// Brute Force Protection
// ============================================

interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}

export class BruteForceProtection {
  private attempts = new Map<string, AttemptRecord>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_MINUTES = 15;

  check(key: string): { allowed: boolean; retryAfter?: number } {
    const record = this.attempts.get(key);
    if (!record) return { allowed: true };

    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      return { allowed: false, retryAfter: Math.ceil((record.lockedUntil - Date.now()) / 1000) };
    }
    if (record.lockedUntil && Date.now() >= record.lockedUntil) {
      this.attempts.delete(key);
      return { allowed: true };
    }
    return { allowed: true };
  }

  recordFailure(key: string): { locked: boolean } {
    const now = Date.now();
    let record = this.attempts.get(key);
    if (!record) {
      record = { count: 0, lockedUntil: null };
      this.attempts.set(key, record);
    }

    // Reset if outside window
    if (record.count > 0 && record.lockedUntil === null) {
      // Simplified: always increment within window
    }

    record.count++;

    if (record.count >= this.MAX_ATTEMPTS) {
      record.lockedUntil = now + this.LOCKOUT_MINUTES * 60 * 1000;
      return { locked: true };
    }
    return { locked: false };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// ============================================
// PII Encryption (AES-256-GCM)
// ============================================

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY || crypto.createHash('sha256').update('radbit-default-dev-key-2026').digest();

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encoded: string): string | null {
  try {
    const parts = encoded.split(':');
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

// ============================================
// Input Sanitization
// ============================================

export function sanitizeHTML(input: string): string {
  return input.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
    return map[char] || char;
  });
}
