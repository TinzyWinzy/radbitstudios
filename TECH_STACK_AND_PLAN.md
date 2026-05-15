# Radbit SME Hub — Tech Stack & Implementation Plan

## Current State: What's Actually Built vs What Exists Only in Docs

### ACTUALLY IMPLEMENTED (Source Code)

| Layer | Status | Files |
|---|---|---|
| **Next.js 14 App** | ✅ 13 routes, working | `src/app/` — full app router with 4 route groups |
| **Auth** | ✅ Firebase Auth + Google OAuth | `src/contexts/auth-context.tsx` |
| **AI Flows** | ✅ 6 Genkit flows, all wired | `src/ai/flows/*.ts` — mentor, tenders, assessment, toolkit, dashboard, moderation |
| **UI Components** | ✅ 35 shadcn components | `src/components/ui/*.tsx` |
| **Theming** | ✅ Dark/light/system | `src/components/theme-provider.tsx` |
| **Tests** | ⚠️ 2 unit + 1 e2e | `src/__tests__/`, `e2e/smoke.spec.ts` |
| **Error Boundaries** | ✅ 4 error.tsx | root, app, auth, marketing |
| **Loading States** | ✅ 4 loading.tsx | root, app, auth, marketing |
| **SEO** | ✅ sitemap.ts + robots.ts | auto-generated |
| **Usage Tracking** | ⚠️ Partial (2/6 features) | `src/services/usage-service.ts` |
| **Offline Engine** | 🔴 CODED BUT DEAD | `src/services/offline.ts` — 210 lines, zero imports |
| **Device Detection** | 🔴 CODED BUT DEAD | `src/lib/device.ts` — 94 lines, zero imports |
| **i18n** | 🔴 CODED BUT DEAD | `src/i18n/request.ts` + `src/messages/*.json` — no NextIntlClientProvider in layout |
| **PWA** | 🔴 MISSING | No `public/sw.js`, no `public/manifest.json`, no SW registration |
| **Payments** | 🔴 Local credit system only | No Stripe, EcoCash, or any payment integration |
| **Database** | 🔴 Firestore only | No PostgreSQL, no Meilisearch, no Redis |

### DOCUMENT-ONLY (Created in Architecture Sessions)

| Document | Contents | Status |
|---|---|---|
| `docs/ARCHITECTURE.md` | C4 diagrams, data flows, perf budgets | 🗺️ Blueprint |
| `docs/DATABASE.md` | Full PostgreSQL DDL, Prisma schema, RLS | 🗺️ Blueprint |
| `docs/COST_ESTIMATES.md` | Pricing for 10k/50k/100k MAU | 🗺️ Blueprint |
| `docs/DR_RUNBOOK.md` | 4 disaster scenarios | 🗺️ Blueprint |
| `docs/AI_GATEWAY.md` | OpenAPI spec, RAG pipeline, 6 prompts | 🗺️ Blueprint |
| `docs/PAYMENTS.md` | Provider strategy pattern, webhooks, dunning | 🗺️ Blueprint |
| `docs/NOTIFICATIONS.md` | WhatsApp menu SM, notification orchestrator | 🗺️ Blueprint |
| `docs/SECURITY.md` | Auth flow, encryption matrix, KYC | 🗺️ Blueprint |
| `docs/THREAT_MODEL.md` | STRIDE, incident runbooks, compliance checklist | 🗺️ Blueprint |
| `docs/CONTENT_STRATEGY.md` | Content hub structure | 🗺️ Blueprint |
| `docs/PLATFORM_OVERVIEW.md` | Stack decisions, domain inventory, KPIs | 🗺️ Blueprint |
| `MATURITY.md` | Maturity assessment + implementation roadmap | 🗺️ Blueprint |
| `infra/terraform/main.tf` | Full Terraform for AWS af-south-1 | 🗺️ Blueprint |
| `database/seed.sql` | 100 SMEs + 50 tenders | 🗺️ Blueprint |

## Maturity: 4.5 / 10

The app is a **working MVP** on Firebase with solid frontend architecture but:
- **Critical gaps**: No payments, no PWA/offline wiring, no i18n, dead code not connected
- **Infrastructure**: Firebase serverless only — no PostgreSQL, no queue, no CDN, no monitoring
- **No revenue mechanism**: Subscription plans are local config only — users can't pay

## Implementation Plan — 12 Weeks to Production

### Sprint 0: Connect Dead Code (Week 1 | 3 days)
> Wire up the code that's already written but disconnected

| Task | Details | Effort |
|---|---|---|
| Create `public/sw.js` | Service Worker with cache strategies + Background Sync from `docs/NOTIFICATIONS.md` | 2h |
| Create `public/manifest.json` | PWA manifest | 30m |
| Register SW + manifest in root `layout.tsx` | Add `<link rel="manifest">` and `<script>` registration | 1h |
| Integrate `offline.ts` into assessment page | Wire `createAutoSave` every 30s, `saveAssessmentDraft`/`getAssessmentDraft` for crash recovery | 3h |
| Integrate `device.ts` into marketing + dashboard | `shouldReduceAnimations`, `getImageQuality`, `shouldUseBlurPlaceholders` | 2h |
| Wire i18n into root layout | Add `NextIntlClientProvider`, configure middleware, add `useTranslations()` to one page (marketing) | 4h |

### Sprint 1: Stabilize & Harden (Week 1-2 | 5 days)
> Production-ready current stack

| Task | Details | Effort |
|---|---|---|
| Complete usage tracking | Add `checkAndDecrementUsage` to toolkit, mentor, dashboard pages | 3h |
| Add Zod validation to remaining forms | Budget entry, messages input, settings profile/business forms | 4h |
| Replace placeholder landing images with optimized versions | WebP/AVIF pipeline | 4h |
| Add `loading.tsx` for nested routes | community/[id], community/new | 1h |
| Add metadata for [id] pages | community thread detail | 1h |
| Run build + fix any remaining lint/type issues | CI readiness | 2h |

### Sprint 2: Backend Migration — PostgreSQL + API Gateway (Weeks 2-4)
> Phase out Firebase backend, deploy production infrastructure

| Task | Details | Effort |
|---|---|---|
| Provision AWS infra via Terraform | VPC, ECS Fargate, RDS PostgreSQL, Redis, S3 | 3d |
| Create NestJS API Gateway + microservices | Auth, Assessment, Tender, AI Orchestrator services | 5d |
| Migrate Firestore data → PostgreSQL | ETL script + migration | 2d |
| Deploy Meilisearch for tender search | Full-text search with typo tolerance | 1d |
| Set up BullMQ queue for async tasks | AI generation jobs, notification emails | 2d |
| CI/CD pipeline | GitHub Actions → ECR → ECS, staging environment | 2d |

### Sprint 3: AI Gateway + RAG (Weeks 4-5)
> Cost-optimized AI layer with local context

| Task | Details | Effort |
|---|---|---|
| Multi-model provider integration | OpenAI + Anthropic SDKs, model routing | 2d |
| Token budgeting per user tier | Redis counters, hard cap enforcement | 1d |
| Pinecone vector DB for RAG | Ingest ZIMRA tax tables, Companies Act, SADC docs | 2d |
| Semantic caching | Cosine similarity > 0.92, 24h TTL | 1d |
| Cost monitoring dashboard | Grafana on CloudWatch metrics | 2d |

### Sprint 4: Payments (Weeks 5-7)
> Revenue engine — mobile money first

| Task | Details | Effort |
|---|---|---|
| EcoCash API integration | Primary Zim payment method | 3d |
| Stripe integration | Card fallback for SA expansion + non-mobile-money users | 2d |
| Payment orchestrator | Country/currency routing, Strategy pattern | 1d |
| Subscription engine | State machine, proration, dunning (3 retries) | 3d |
| Invoice generation | ZIMRA-compliant PDF | 2d |
| Webhook handlers | Idempotent processing for all providers | 2d |

### Sprint 5: WhatsApp + Notifications (Weeks 6-8)
> Primary engagement channel

| Task | Details | Effort |
|---|---|---|
| Meta WhatsApp Cloud API onboarding | Business verification, template approval | 1w |
| WhatsApp webhook + menu system | 5-menu state machine with escalation | 3d |
| Notification orchestrator | Priority → channel routing, rate limiting | 2d |
| SMS fallback (Twilio) | For WhatsApp-undelivered messages | 1d |
| Push notifications (FCM/VAPID) | Web Push via service worker | 1d |
| Delivery analytics | Sent/delivered/read/failed dashboard | 2d |

### Sprint 6: Compliance + Security (Weeks 7-9)
> Production security hardening

| Task | Details | Effort |
|---|---|---|
| JWT rotation (RS256, 90d keys) | Custom auth service | 2d |
| RBAC middleware | 5-role access control on API Gateway | 1d |
| Brute force protection | 5 OTP attempts → 15 min lockout | 1d |
| PII encryption (AES-256-GCM + KMS) | Application-level encryption for sensitive fields | 2d |
| GDPR deletion flow | UI + `gdpr_anonymize_user()` stored procedure | 1d |
| OWASP ZAP scanning | Automated CI security scanning | 1d |
| External penetration test | Third-party audit, remediate findings | 1w |

### Sprint 7: SEO + Content + Launch (Weeks 8-12)
> Growth engine

| Task | Details | Effort |
|---|---|---|
| Build `/resources` SEO section | 5 pillar pages + 30 cluster articles | 2w |
| Structured data | FAQPage, HowTo, Organization schema on all pages | 2d |
| AdSense integration | Lazy-loaded responsive ad units on blog | 1d |
| Share card generator | "My Score: 72/100" social media images | 2d |
| Referral program | UTM + 100 AI credits per referral | 2d |
| k6 load testing | 1,000 concurrent, p95 < 800ms | 2d |
| DR failover testing | Cross-region RDS promotion drill | 1d |

## Architecture Decisions

### Stay: Current Tech
| Decision | Reason |
|---|---|
| **Next.js 14 App Router** | Working well. SSG for landing, SSR for dashboards, client for tools. |
| **Firebase Auth** | Reliable, free tier, good for OTP + Google OAuth. Can co-exist with custom backend. |
| **shadcn/ui + Tailwind** | Already invested. 35 components used. |
| **Zod validation** | Integrated with react-hook-form on toolkit. Adding to remaining forms is low effort. |
| **Genkit AI flows** | 6 flows already built and wired. Keep until AI Gateway (Sprint 3) replaces them. |

### Migrate From → To
| From | To | When | Why |
|---|---|---|---|
| Firestore → PostgreSQL | NestJS + RDS | Sprint 2 | Relational data (tenders, payments, subscriptions). JSONB for flexible fields. RLS for multi-tenant. |
| Firebase Auth → Custom JWT | NestJS Auth Service | Sprint 2 | Phone-first OTP auth. Need rotation + RBAC not possible in Firebase Auth alone. |
| Genkit → AI Gateway | NestJS + OpenAI/Anthropic | Sprint 3 | Cost optimization (GPT-4o-mini for simple tasks). RAG for local context. Token budgeting. |
| In-memory cache → Redis | ElastiCache | Sprint 2 | Session persistence across instances. Rate limiting. Queue adapter. |
| File-based i18n → next-intl | Root layout wrapper | Sprint 0 | Already installed. Just need to wire into component tree. |
| Firebase Hosting → AWS ECS Fargate | Terraform | Sprint 2 | Multi-region, proper autoscaling, VPC isolation, DR capability. |

## Quick Wins (Week 1 — 3 days)
These take the app from 4.5 → 5.5 with almost no new code:

1. **Create `public/sw.js`** (2h) — Cache strategies from docs
2. **Create `public/manifest.json`** (30m) — PWA manifest  
3. **Register SW + manifest in layout** (1h) — 3 lines to layout.tsx
4. **Wire offline auto-save into assessment** (3h) — Import existing `offline.ts` functions
5. **Wire device detection into marketing** (2h) — Import existing `device.ts` functions
6. **Wire i18n into layout + add `useTranslations`** (4h) — Import existing `i18n/request.ts`, add `NextIntlClientProvider`
7. **Complete usage tracking on remaining pages** (3h) — 4 pages need `checkAndDecrementUsage` calls

**Total: ~16 hours** — all code exists, just needs importing and wiring.
