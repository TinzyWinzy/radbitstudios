# Radbit SME Hub — Complete Architecture Overview

## Stack Decision Matrix

| Layer | Current (MVP) | Production Target | Rationale |
|---|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Next.js 14 (App Router) | SSG/ISR/SSR per page. PWA support. |
| **Backend** | Next.js API + Genkit | NestJS microservices | Separate API gateway for rate limiting + multi-service scaling. |
| **Database** | Firestore (NoSQL) | PostgreSQL 15+ | Relational data (assessments, tenders, users, payments). JSONB for flexible fields. RLS for multi-tenant. |
| **Cache** | In-memory (dev only) | Redis Cluster | Session store, rate limiting, AI response cache, Socket.IO adapter. |
| **Search** | Firestore queries | Meilisearch | Full-text search on tenders with typo tolerance, faceted filtering, geo-search. |
| **File Storage** | Firebase Storage | AWS S3 + CloudFront | Image optimization pipeline (AVIF/WebP via Lambda@Edge). |
| **Auth** | Firebase Auth | Custom JWT + OTP | Phone-first auth (WhatsApp OTP). Zim/SADC phone number validation. |
| **Payments** | None | Stripe + EcoCash + PayFast | Multi-currency mobile money orchestration. |
| **AI** | Gemini 2.0 Flash (Genkit) | Multi-model gateway | Cost-optimized routing (mini models for simple tasks). RAG for local context. |
| **Messaging** | None | WhatsApp Business API | Primary engagement channel. Menu system + notifications. |
| **Monitoring** | None | CloudWatch + Grafana + PagerDuty | Cost monitoring per user. AI token budgets. |
| **CI/CD** | Firebase App Hosting | GitHub Actions → ECR → ECS Fargate | Staging deploy < 30 min. Automated rollback on failure. |
| **Infrastructure** | Firebase (serverless) | AWS af-south-1 + Cloudflare | SADC latency optimization. DR in eu-west-1. |

## Domain Inventory

| Domain | Subdomain | Purpose | Cache | Auth |
|---|---|---|---|---|
| Marketing | `radbitsmehub.co.zw` | Landing, resources, blog | Cloudflare Edge (365d for static) | Public |
| App | `app.radbitsmehub.co.zw` | Dashboard, tools, community | SW stale-while-revalidate | JWT required |
| API | `api.radbitsmehub.co.zw` | REST + WebSocket | Cloudflare (5min, varies by endpoint) | JWT + API key |
| AI | `ai.radbitsmehub.co.zw` | AI Gateway (internal) | No edge cache | Service-to-service |
| Admin | `admin.radbitsmehub.co.zw` | Internal dashboard | No cache | SSO + IP whitelist |
| CDN | `cdn.radbitsmehub.co.zw` | Images, fonts, static assets | CloudFront (365d) | Public |
| Status | `status.radbitsmehub.co.zw` | Uptime + incident status | No cache | Public |

## Key Metrics Dashboard

| KPI | Current | Target (90d) | Source |
|---|---|---|---|
| FCP (simulated 3G) | — | < 1.2s | Lighthouse CI |
| Lighthouse Performance | — | > 90 | Lighthouse CI |
| P95 API response | — | < 800ms @ 1,000 concurrent | k6 |
| AI response latency | — | < 3s text, < 8s image | CloudWatch |
| Cost per business plan | — | < $0.15 | AI Gateway logs |
| Monthly AI budget/utilization | — | < 100% | Grafana |
| WhatsApp message delivery rate | — | > 95% | Notification analytics |
| SMS fallback delivery | — | < 5s | Twilio logs |
| RAG citation accuracy | — | > 95% | Manual audit |
| SEO: "register business zim" rank | — | Page 1 | GSC / SEMrush |
| SEO: organic signup % | — | > 30% | Analytics + DB |
| Adsense revenue | — | > $100/mo | AdSense API |
| MRR | — | — | Invoices DB |
| Churn rate | — | < 5% | Subscriptions DB |
| Subscription via mobile money | — | > 60% | EcoCash + OneMoney logs |

## Deployment Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  GitHub  │───▶│  Actions │───▶│  ECR     │───▶│  ECS     │
│  (code)  │    │  (CI/CD) │    │  (image) │    │  (run)   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │
                     ▼
               ┌──────────┐
               │  Build   │
               │  Checks  │
               │  - type  │
               │  - lint  │
               │  - test  │
               │  - bundle│
               └──────────┘
                     │
                     ▼
               ┌──────────┐
               │  Deploy  │
               │  Staging │
               │  - k6    │
               │  - ZAP   │
               │  - Lighthouse│
               └──────────┘
                     │
                     ▼
               ┌──────────┐
               │  Promote │
               │  to Prod │
               │  (manual │
               │  gate)   │
               └──────────┘
```
