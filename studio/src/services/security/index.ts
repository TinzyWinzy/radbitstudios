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
// Brute Force Protection (Firestore-backed)
// ============================================

import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const BRUTEFORCE_COLLECTION = 'bruteforce_attempts';

interface BFRecord {
  key: string;
  count: number;
  lockedUntil: number | null;
  windowStart: number;
  updatedAt: FieldValue;
}

/**
 * Firestore-backed brute force protection.
 * Survives serverless cold starts (unlike in-memory Map).
 * Each key is a single document — updated atomically.
 */
export class BruteForceProtection {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_MINUTES = 15;
  private readonly WINDOW_MS = 15 * 60 * 1000;

  async check(key: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    try {
      const docRef = adminDb.doc(`${BRUTEFORCE_COLLECTION}/${key.replace(/[^a-zA-Z0-9_-]/g, '_')}`);
      const snap = await docRef.get();
      const record = snap.data() as BFRecord | undefined;

      if (!record) return { allowed: true };

      const now = Date.now();

      if (record.lockedUntil && now < record.lockedUntil) {
        return { allowed: false, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
      }

      if (record.lockedUntil && now >= record.lockedUntil) {
        await docRef.delete().catch(() => {});
        return { allowed: true };
      }

      if (now - record.windowStart > this.WINDOW_MS) {
        await docRef.delete().catch(() => {});
        return { allowed: true };
      }

      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  }

  async recordFailure(key: string): Promise<{ locked: boolean }> {
    try {
      const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      const docRef = adminDb.doc(`${BRUTEFORCE_COLLECTION}/${safeKey}`);
      const now = Date.now();

      await adminDb.runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        const record = snap.data() as BFRecord | undefined;

        if (!record || now - record.windowStart > this.WINDOW_MS) {
          tx.set(docRef, {
            key: safeKey,
            count: 1,
            lockedUntil: null,
            windowStart: now,
            updatedAt: FieldValue.serverTimestamp(),
          });
          return;
        }

        const newCount = record.count + 1;
        if (newCount >= this.MAX_ATTEMPTS) {
          tx.update(docRef, {
            count: newCount,
            lockedUntil: now + this.LOCKOUT_MINUTES * 60 * 1000,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          tx.update(docRef, {
            count: newCount,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });

      const updated = await docRef.get();
      const data = updated.data() as BFRecord | undefined;
      return { locked: !!data?.lockedUntil };
    } catch {
      return { locked: false };
    }
  }

  async reset(key: string): Promise<void> {
    try {
      const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      await adminDb.doc(`${BRUTEFORCE_COLLECTION}/${safeKey}`).delete();
    } catch {}
  }
}

// ============================================
// PII Encryption (AES-256-GCM)
// ============================================

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    return Buffer.from(envKey, 'hex').length === 32
      ? Buffer.from(envKey, 'hex')
      : crypto.createHash('sha256').update(envKey).digest();
  }
  // Allow fallback in development only
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Security] ENCRYPTION_KEY not set — using development fallback. Set ENCRYPTION_KEY in production.');
    return crypto.createHash('sha256').update('radbit-dev-only-key-not-for-production').digest();
  }
  throw new Error(
    'ENCRYPTION_KEY environment variable is required in production. ' +
    'Generate one with: openssl rand -hex 32'
  );
}

const KEY = getEncryptionKey();

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
