# Security Architecture — Radbit SME Hub

## Authentication Flow

```
User enters phone number
    │
    ▼
PUT /api/auth/otp/request
    │  ← 6-digit code sent via SMS/WhatsApp
    ▼
POST /api/auth/otp/verify
    │  ← JWT (15 min) + Refresh Token (7 days, HTTP-only)
    ▼
┌──────────────────────────────────────────────┐
│            Token Management                   │
│                                               │
│  Access Token (JWT):                          │
│   - Claims: sub, email, phone, role, country  │
│   - Expiry: 15 minutes                        │
│   - Signed with RS256 (rotated every 90d)     │
│                                               │
│  Refresh Token:                               │
│   - Random 128-byte value                     │
│   - Stored in DB (hashed)                     │
│   - Expiry: 7 days                            │
│   - Rotated on each use (old invalidated)     │
│                                               │
│  Session (Redis):                             │
│   - Key: session:{userId}                     │
│   - Fields: device info, IP, last activity    │
│   - TTL: 7 days                               │
└──────────────────────────────────────────────┘
```

## RBAC Model

| Role | Scope | Permissions |
|---|---|---|
| `sme_owner` | Own data | Full CRUD on own business, assessments, tenders |
| `sme_staff` | Own data + business | Read business profile, manage assigned tenders |
| `admin` | All | Platform-wide read, user management, content moderation |
| `partner_bank` | Filtered | View SME verification status (KYC only) |
| `partner_gov` | Filtered | View aggregated tender statistics |

## Security Headers (Cloudflare + Application)

```typescript
// next.config.js
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Content-Security-Policy', value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googletagmanager.com https://pagead2.googlesyndication.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.googleusercontent.com https://*.cloudfront.net https://placehold.co https://picsum.photos",
    "font-src 'self'",
    "connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://firestore.googleapis.com https://*.googleapis.com https://generativelanguage.googleapis.com",
    "frame-src 'self' https://*.firebaseapp.com",
    "media-src 'self'",
  ].join('; ') },
];
```

## Encryption Strategy

| Data Type | Encryption | Method |
|---|---|---|
| Passwords | Hashed (bcrypt, cost 12) | Application layer |
| Payment tokens | AES-256-GCM + KMS | Application layer (before DB) |
| Phone numbers | AES-256 (at rest) | RDS default |
| ID numbers (ZIMRA, national ID) | AES-256-GCM | Application layer + masked in logs |
| AI prompts/output | Unencrypted (user-accessible) | — |
| Session tokens | SHA-256 hash (refresh) | Application layer |
| Files (S3) | SSE-S3 or SSE-KMS | S3 default |
| Database (RDS) | AES-256 | RDS default encryption |
| In transit | TLS 1.3 | Network layer |

## Audit Logging

```sql
-- Immutable audit log for compliance events
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,
    action          VARCHAR(50) NOT NULL,   -- e.g., 'tender_applied', 'ai_generated', 'payment_made'
    entity_type     VARCHAR(50) NOT NULL,   -- e.g., 'tender', 'ai_generation', 'invoice'
    entity_id       UUID,
    old_values      JSONB,                  -- NULL for create operations
    new_values      JSONB,                  -- NULL for delete operations
    ip_address      INET,
    user_agent      TEXT,
    session_id      VARCHAR(100),
    country_code    CHAR(2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- PII is NEVER logged. Phone numbers, ID numbers, payment tokens are masked.
-- Example: "payment_made" logs the invoice ID and amount, NOT the card number.
```

## Brute Force Protection

```typescript
// src/services/auth/rate-limiter.ts

export class BruteForceProtection {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_MINUTES = 15;
  private readonly WINDOW_MINUTES = 5;

  async checkOTP(phone: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const attempts = await this.getRecentAttempts(phone, this.WINDOW_MINUTES);

    if (attempts >= this.MAX_ATTEMPTS) {
      const lockoutUntil = await this.getLockoutTime(phone);
      if (lockoutUntil && lockoutUntil > new Date()) {
        const retryAfter = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
        return { allowed: false, retryAfter };
      }
      // Lockout period expired, reset counter
      await this.resetAttempts(phone);
    }

    return { allowed: true };
  }

  async recordFailedAttempt(phone: string): Promise<void> {
    const attempts = await this.incrementAttempt(phone, this.WINDOW_MINUTES);

    if (attempts >= this.MAX_ATTEMPTS) {
      await this.setLockout(phone, this.LOCKOUT_MINUTES);
      // Notify user
      await this.notificationService.send({ userId: phone, template: 'otp_locked', data: { retryMinutes: this.LOCKOUT_MINUTES } });
    }
  }

  private async getRecentAttempts(phone: string, windowMinutes: number): Promise<number> {
    const key = `otp:attempts:${phone}`;
    return parseInt(await redis.get(key) || '0');
  }

  private async incrementAttempt(phone: string, windowMinutes: number): Promise<number> {
    const key = `otp:attempts:${phone}`;
    const attempts = await redis.incr(key);
    if (attempts === 1) await redis.expire(key, windowMinutes * 60);
    return attempts;
  }
}
```

## OWASP ZAP Scan Targets

| Endpoint | Method | Expected Status | Risk |
|---|---|---|---|
| `POST /api/auth/otp/request` | POST | 200/429 | Medium (brute force) |
| `POST /api/auth/otp/verify` | POST | 200/401 | High (rate limited) |
| `POST /api/ai/generate` | POST | 200/402/503 | Medium (injection) |
| `GET /api/tenders` | GET | 200 | Low |
| `POST /api/community/posts` | POST | 201 | Medium (XSS in content) |
| `PUT /api/settings/profile` | PUT | 200 | Medium (mass assignment) |
| `GET /resources/` | GET | 200 | Low |

## Vulnerability Management

| Tool | Scope | Schedule |
|---|---|---|
| Dependabot | npm dependencies | Weekly scan + auto-PR |
| Snyk | npm + Docker images | Per commit |
| OWASP ZAP | API + Web | Weekly automated scan |
| Penetration test | Full stack | Quarterly (external firm) |
| Bug bounty | Public | HackerOne after 6 months |

## KYC Flow

```typescript
// src/services/kyc/kyc.service.ts

export class KYCService {
  async verifyBusiness(userId: string, documentUrl: string): Promise<KYCResult> {
    // 1. OCR extract reg number
    const ocrResult = await this.ocrService.extract(documentUrl, ['registration_number', 'company_name']);

    // 2. Cross-check format per country
    const countryFormat = this.getRegistrationFormat(countryCode);
    if (!countryFormat.test(ocrResult.registration_number)) {
      return { status: 'rejected', reason: 'Invalid registration number format for this country' };
    }

    // 3. Cross-check against official API (where available)
    const verificationResult = await this.crossCheckWithRegistry(countryCode, ocrResult.registration_number);

    // 4. AI fraud check
    const aiCheck = await this.aiFraudCheck(documentUrl);

    // 5. Human review queue (if AI flags)
    if (aiCheck.riskScore > 0.7) {
      await this.addToHumanReviewQueue(userId, { ocrResult, verificationResult, aiCheck });
      return { status: 'pending_review' };
    }

    return { status: 'verified' };
  }
}
```
