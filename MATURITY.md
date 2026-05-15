# Radbit SME Hub — System Maturity Assessment & Implementation Plan

## Maturity Rating: 4.5 / 10

### Score Breakdown

| Dimension | Score | Rationale |
|---|---|---|
| **Frontend** | 6.5 | Functional Next.js 14 app with 13 routes, 38 shadcn components, dark/light theme, responsive layout, Zod validation on key forms, error boundaries, loading states. Missing: PWA installability, offline support, i18n integration, performance budgets, device adaptation. |
| **Backend** | 3.0 | MVP-level: Firebase Auth + Firestore + 6 Genkit AI flows. No API gateway, no microservices, no Redis, no queue system, no rate limiting enforcement, no WebSocket support. Graceful degradation not implemented. |
| **Database** | 2.5 | Firestore (NoSQL) — insufficient for relational data (tenders, payments, subscriptions, invoices). No PostgreSQL, no RLS, no audit logging. Schema exists in docs/ but not deployed. |
| **AI/ML** | 4.0 | 6 Genkit flows with Gemini 2.0 Flash. Zod schemas on all inputs, try/catch on all flows, caching on dashboard. Missing: multi-model routing, token budgeting, RAG, semantic caching, A/B testing, cost monitoring. |
| **PWA & Offline** | 1.0 | Manifest + SW created but not wired into app. No service worker registration in root layout. No IndexedDB hooks integrated. No Background Sync usage. No offline detection in components. |
| **Payments** | 0.5 | Subscription plan definitions exist. No payment integration, no EcoCash/Stripe, no multi-currency, no invoice generation, no billing engine, no webhook handling. |
| **Communications** | 0.5 | Basic in-app toast notifications only. No WhatsApp integration, no SMS, no push notifications, no email, no notification orchestration, no WhatsApp menu. |
| **Security** | 3.5 | Firestore rules are good. `.env` removed from git. Zod validation on inputs. Firebase Auth with OTP + Google. Missing: JWT rotation, RBAC beyond auth check, rate limiting enforcement, encryption at rest for PII, audit logging, CSP headers, brue force protection, OWASP scanning. |
| **Compliance** | 1.0 | No compliance documentation integrated into codebase. No GDPR deletion flow wired. No POPIA/Zim Cyber Act consent capture. No cookie banner. No privacy policy in footer. |
| **Infrastructure** | 2.0 | Firebase App Hosting with `apphosting.yaml`. No Terraform, no AWS, no Cloudflare, no CDN configuration deployed, no monitoring, no CI/CD pipeline beyond Firebase, no staging environment. |
| **SEO & Content** | 1.5 | Sitemap + robots created. Per-page metadata added. No content hub, no structured data, no blog, no keyword targeting, no AdSense, no analytics pipeline. |
| **Documentation** | 7.0 | Comprehensive docs: architecture, database, Terraform, cost estimates, DR runbook, AI gateway, payments, notifications, security, threat model, content strategy, platform overview. |

## Implementation Roadmap

### Phase 0 — Stabilize Current MVP (Week 1-2 | Effort: Low | Impact: High)
> **Target maturity after phase: 5.0/10**

| # | Task | Files | Effort |
|---|---|---|---|
| 0.1 | Wire SW + manifest into root layout | `src/app/layout.tsx`, `public/sw.js` | 2h |
| 0.2 | Integrate offline assessment engine (IndexedDB) | `src/services/offline.ts` into `assessment/page.tsx` | 4h |
| 0.3 | Add device detection hooks to marketing + dashboard | `src/lib/device.ts` → image quality, animation reduction | 3h |
| 0.4 | Wire up i18n (next-intl middleware + locale detection) | `src/i18n/request.ts`, `middleware.ts`, layout | 6h |
| 0.5 | Add CSP + HSTS security headers | `next.config.js` | 1h |
| 0.6 | Deploy staging environment (Firebase App Hosting branch) | `apphosting.yaml` | 2h |
| 0.7 | Privacy policy page + cookie consent banner | `src/app/privacy/page.tsx`, `src/components/cookie-banner.tsx` | 4h |

### Phase 1 — Backend Migration to PostgreSQL + NestJS (Weeks 3-6 | Effort: High | Impact: Critical)
> **Target maturity after phase: 6.0/10**

| # | Task | Details | Effort |
|---|---|---|---|
| 1.1 | Provision PostgreSQL on AWS RDS (af-south-1) | Terraform `modules/database/` | 1d |
| 1.2 | Create NestJS API Gateway + microservices scaffold | NestJS monorepo with auth, assessment, tender services | 5d |
| 1.3 | Migrate Firestore data → PostgreSQL | ETL script + run migration | 2d |
| 1.4 | Implement RLS + audit logging in PostgreSQL | Apply DDL from `docs/DATABASE.md` | 1d |
| 1.5 | Deploy Meilisearch for tender full-text search | Terraform `modules/search/` | 1d |
| 1.6 | Set up Redis cluster for sessions + caching | Terraform `modules/redis/` | 1d |
| 1.7 | Wire BullMQ for async AI generation + notifications | Queue integration in NestJS | 2d |

### Phase 2 — AI Gateway + RAG (Weeks 4-7 | Effort: High | Impact: High)
> **Target maturity after phase: 6.5/10**

| # | Task | Details | Effort |
|---|---|---|---|
| 2.1 | OpenAI + Anthropic SDK integration | Multi-model provider abstraction | 2d |
| 2.2 | Implement model routing (simple → GPT-4o-mini, complex → GPT-4o) | AI Gateway middleware | 1d |
| 2.3 | Token budgeting per user tier (Free: $0.50, Growth: $3, Pro: $10) | Redis counters, hard cap enforcement | 1d |
| 2.4 | Set up Pinecone vector DB for RAG | Ingest ZIMRA tax tables, Companies Act, SADC trade docs | 2d |
| 2.5 | Implement semantic caching (cosine > 0.92, 24h TTL) | Pinecone + Redis cache layer | 1d |
| 2.6 | Build 20 prompt templates (see `docs/AI_GATEWAY.md`) | Version-controlled prompt library in `db` or files | 2d |
| 2.7 | Cost monitoring dashboard (Grafana) | CloudWatch metrics → Grafana | 2d |

### Phase 3 — Payments (Weeks 6-8 | Effort: High | Impact: High)
> **Target maturity after phase: 7.0/10**

| # | Task | Details | Effort |
|---|---|---|---|
| 3.1 | EcoCash API integration | `EcoCashProvider` implementing `PaymentProvider` interface | 3d |
| 3.2 | Stripe integration (card payments) | `StripeProvider` | 2d |
| 3.3 | PayFast integration (SA expansion) | `PayFastProvider` | 2d |
| 3.4 | Payment orchestrator + Strategy pattern | `PaymentOrchestrator` with country/currency routing | 1d |
| 3.5 | Subscription lifecycle engine (state machine) | `SubscriptionService` with proration, dunning | 3d |
| 3.6 | Invoice generation (ZIMRA-compliant) | PDF generation + multi-currency support | 2d |
| 3.7 | Webhook handlers (all providers, idempotent) | Redis-backed dedup, 7-day replay window | 2d |

### Phase 4 — WhatsApp + Notifications (Weeks 7-9 | Effort: Medium | Impact: High)
> **Target maturity after phase: 7.5/10**

| # | Task | Details | Effort |
|---|---|---|---|
| 4.1 | Meta WhatsApp Cloud API onboarding | Phone number verification, template approval | 1w |
| 4.2 | WhatsApp webhook handler + menu state machine | `WhatsAppMenuSystem` with 5 menus | 3d |
| 4.3 | Notification orchestrator (priority → channel) | `NotificationOrchestrator` with rate limiting | 2d |
| 4.4 | SMS fallback (Twilio for Zimbabwe) | `SMSProvider` | 1d |
| 4.5 | Push notifications (FCM/VAPID) | `PushProvider` + permission prompt in app | 1d |
| 4.6 | Delivery analytics dashboard | Sent, Delivered, Read, Failed per channel | 2d |

### Phase 5 — Compliance + Security (Weeks 8-10 | Effort: Medium | Impact: High)
> **Target maturity after phase: 8.0/10**

| # | Task | Details | Effort |
|---|---|---|---|
| 5.1 | JWT rotation (RS256, 90d keys) | Custom auth service with refresh tokens | 2d |
| 5.2 | RBAC middleware (API Gateway) | Role-check middleware for all routes | 1d |
| 5.3 | Brute force protection (5 OTP → 15 min lockout) | `BruteForceProtection` | 1d |
| 5.4 | PII encryption at rest (AES-256-GCM + KMS) | Application-level encryption service | 2d |
| 5.5 | GDPR deletion flow (frontend + stored proc) | UI + `gdpr_anonymize_user()` | 1d |
| 5.6 | OWASP ZAP automated scanning | CI pipeline integration | 1d |
| 5.7 | KYC flow (OCR → registry check → human review) | Document upload + verification pipeline | 3d |

### Phase 6 — SEO + Content (Weeks 8-12 | Effort: Medium | Impact: Medium)
> **Target maturity after phase: 8.5/10**

| # | Task | Details | Effort |
|---|---|---|---|
| 6.1 | Build `/resources` section with 5 pillar pages | Content creation + structured data | 2w |
| 6.2 | Add FAQPage schema to all pages | Structured data generator | 2d |
| 6.3 | AdSense lazy-load integration | `<AdUnit>` component on blog pages | 1d |
| 6.4 | Share card generator ("My Score: 72/100") | Social media image generation | 2d |
| 6.5 | Referral program (invite 3 → 100 credits) | UTM tracking + credit ledger integration | 2d |

### Phase 7 — Infrastructure Production (Weeks 10-14 | Effort: High | Impact: Critical)
> **Target maturity after phase: 9.0/10**

| # | Task | Details | Effort |
|---|---|---|---|
| 7.1 | Apply Terraform for staging environment | Full deploy: VPC, ECS, RDS, Redis, Meilisearch | 2d |
| 7.2 | Cloudflare CDN + WAF + Argo | Production edge configuration | 1d |
| 7.3 | CI/CD pipeline (GitHub Actions → ECR → ECS) | Build, test, deploy automation | 2d |
| 7.4 | Monitoring + alerting (CloudWatch, PagerDuty) | Dashboards, alarms, on-call rotation | 2d |
| 7.5 | k6 load testing (1,000 concurrent, p95 < 800ms) | Load test suite + infra tuning | 2d |
| 7.6 | DR replica (eu-west-1 warm standby) | Cross-region RDS + S3 replication | 2d |
| 7.7 | Penetration test by external firm | Remediation of findings | 1w |

## Visual Roadmap

```
W1  W2  W3  W4  W5  W6  W7  W8  W9  W10 W11 W12 W13 W14
│   │   │   │   │   │   │   │   │   │   │   │   │   │
Phase 0 (Stabilize)    ════╗
Phase 1 (Backend)      ════════════╗
Phase 2 (AI Gateway)         ════════════╗
Phase 3 (Payments)                 ════════════╗
Phase 4 (WhatsApp)                      ════════════╗
Phase 5 (Security)                     ════════════════╗
Phase 6 (SEO/Content)                    ════════════════╗
Phase 7 (Infrastructure)                       ════════════════╣
                                                        │
                                                  Target: 9.0/10
```

## Milestone Summary

| Milestone | Date | Maturity | Key Result |
|---|---|---|---|
| M0: Current | Today | **4.5/10** | Working MVP on Firebase, production gaps identified |
| M1: Stabilized | Week 2 | **5.0/10** | PWA installable, offline assessment, i18n active |
| M2: New Backend | Week 6 | **6.0/10** | PostgreSQL live, NestJS gateway serving traffic, Meilisearch searchable |
| M3: AI Optimized | Week 7 | **6.5/10** | Multi-model gateway, RAG active, token budgeting enforced |
| M4: Monetized | Week 8 | **7.0/10** | EcoCash + Stripe live, subscriptions selling |
| M5: Connected | Week 9 | **7.5/10** | WhatsApp menu live, notifications reaching users |
| M6: Compliant | Week 10 | **8.0/10** | Pen test passed, compliance checklist complete |
| M7: Production | Week 14 | **9.0/10** | k6 test passed, DR tested, full Terraform deploy < 30 min |
