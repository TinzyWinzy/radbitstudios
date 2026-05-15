# Radbit SME Hub — Architecture (C4 Model)

## Context Diagram (Level 1)

```
┌─────────────────────────┐     ┌──────────────────────────────┐
│                         │     │                              │
│  Zimbabwean SME Owner   │────▶│   Radbit SME Hub Platform   │
│  (Tecno/Itel Android,   │     │   [Next.js 14 + NestJS]     │
│   3G, low-end device)   │     │                              │
│                         │◀────│                              │
└─────────────────────────┘     └───────────┬──────────────────┘
                                            │
                ┌───────────────────────────┼──────────────────────┐
                │                           │                      │
                ▼                           ▼                      ▼
      ┌─────────────────┐       ┌──────────────────┐    ┌─────────────────┐
      │  Google Gemini   │       │   Firebase Auth  │    │   Paynow /      │
      │  AI (2.0 Flash)  │       │   + Firestore    │    │   Stripe        │
      └─────────────────┘       └──────────────────┘    └─────────────────┘
```

## Container Diagram (Level 2)

### Containers Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Cloudflare CDN                               │
│  (African edge: Johannesburg, Lagos, Nairobi, Cape Town)            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Static assets (AVIF/WebP), API caching, DDoS protection    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  AWS Cape Town (af-south-1)                                         │
│                                                                     │
│  ┌──────────────────────┐    ┌──────────────────────────────┐       │
│  │  Next.js 14 (App     │    │  NestJS API Gateway           │       │
│  │  Router)             │◀──▶│  + Microservices             │       │
│  │  - SSR with HTTP/2   │    │  - Auth Service              │       │
│  │  - PWA Shell         │    │  - Assessment Service        │       │
│  │  - 180KB JS budget   │    │  - Tender Service            │       │
│  │  - System font       │    │  - AI Orchestrator Service   │       │
│  │  - SW: Workbox       │    │  - Notification Service      │       │
│  └──────────────────────┘    │  - Payment Service           │       │
│               │              └──────────┬───────────────────┘       │
│               │                         │                           │
│               ▼                         ▼                           │
│  ┌──────────────────────┐    ┌──────────────────────────────┐       │
│  │  Redis Cluster        │    │  BullMQ (Message Queue)      │       │
│  │  - Session cache      │    │  - AI generation jobs        │       │
│  │  - Rate limiting      │    │  - WhatsApp notifications   │       │
│  │  - Socket.IO adapter  │    │  - Email digests            │       │
│  └──────────────────────┘    │  - PDF generation            │       │
│                              └──────────────────────────────┘       │
│                         │                                           │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 15+ (Primary: ap-southeast-1)                     │   │
│  │  - Multi-tenant (RLS)                                        │   │
│  │  - Partitioned by country_code                               │   │
│  │  - Read replicas for SADC expansion                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                         │                                           │
│                         ▼                                           │
│  ┌──────────────────────┐    ┌──────────────────────────────┐       │
│  │  S3 + CloudFront     │    │  Meilisearch (Tenders)       │       │
│  │  - Image optimization│    │  - Full-text search          │       │
│  │  - Lambda @ edge     │    │  - Geo-filtering             │       │
│  └──────────────────────┘    └──────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DR: eu-west-1 (Frankfurt)                                          │
│  - PostgreSQL read replica (async)                                  │
│  - S3 cross-region replication                                      │
│  - Warm standby (reduced capacity)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Details

#### Frontend (Next.js 14 — `studio/`)
| Component | Technology | Purpose |
|---|---|---|
| App Shell | PWA + Service Worker | Offline-first shell. Cache-first strategy |
| Marketing | Server Components | SEO-optimized landing, static generation |
| Auth | Client Components | OTP phone auth, Google OAuth, refresh tokens |
| Assessment | Client Components + ISR | 15-step wizard. Progress saved to IndexedDB every 30s |
| Dashboard | Client + Server Components | Server-fetched assessment results, AI insights (cached) |
| AI Toolkit | Client Components | Lazy-loaded AI tools. Stale-while-revalidate |
| Tenders | Client Components + SSR | Meilisearch-backed, cached in IndexedDB |
| Community | Client Components | Real-time via WebSocket → SSE fallback |
| Mentor | Client Components | AI chatbot, offline message queue |
| Messages | Client Components | Real-time DM via WebSocket |
| Settings | Client Components | Profile, subscription, history |

#### Backend Services (NestJS)
| Service | Responsibility | Database | Scaling |
|---|---|---|---|
| API Gateway | Auth, routing, rate limiting | Redis (session) | Horizontal (ALB) |
| Auth Service | OTP, JWT, OAuth | PostgreSQL | 2-4 pods |
| Assessment Service | CRUD, scoring, reports | PostgreSQL | 2-4 pods |
| Tender Service | CRUD, search, alerts | PostgreSQL + Meilisearch | 4-8 pods |
| AI Orchestrator | Route to Gemini, queue, retry | Redis (rate limits) | 2-4 pods |
| Notification Service | Push, WhatsApp, email | Redis + BullMQ | 2-4 pods |
| Payment Service | Paynow, Stripe, invoices | PostgreSQL | 2-4 pods |
| Image Service | Upload, resize, AVIF/WebP | S3 + Lambda | Serverless |

### Data Flow: Offline Assessment Submission
```
User answers question 15/15
  → Zustand saves to IndexedDB (autosave every 30s)
  → Service Worker intercepts POST /api/assessment/submit
  → [Online]  → Forward to NestJS → PostgreSQL → Return success
  → [Offline] → Queue in IndexedDB via Background Sync
               → Display "Pending sync" badge
               → On reconnect: Background Sync fires retry
               → On success: Remove badge, update local cache
```

### Data Flow: AI Toolkit (Graceful Degradation)
```
User requests "Financial Projection"
  → API Gateway checks rate limit via Redis
  → AI Orchestrator receives request
  → [Gemini available]  → Call Gemini → Return result → Save to `ai_generations`
  → [Gemini degraded]   → Return cached version from DB (if exists)
                           → Return "AI service busy, showing last generated result"
                           → Queue regeneration job to BullMQ
  → [No cached version]  → Return template-based projection with disclaimer
                           → Queue regeneration, notify user when ready
```

### CDN & Caching Strategy
| Content | Cache Strategy | CDN Edge TTL |
|---|---|---|
| Static JS/CSS | Immutable, hash-based | 365 days |
| User images (AVIF/WebP) | Cache-first | 30 days |
| API: Tenders list | Stale-while-revalidate | 5 min |
| API: Assessment results | Network-first (user-specific) | None |
| API: Community posts | Stale-while-revalidate | 1 min |
| AI-generated content | Cache with TTL | 4 hours |

### Performance Budgets
| Metric | Target | Enforcement |
|---|---|---|
| First Contentful Paint | < 1.2s (simulated 3G) | Lighthouse CI |
| Largest Contentful Paint | < 2.5s | Lighthouse CI |
| Time to Interactive | < 3.5s | Lighthouse CI |
| Total Blocking Time | < 200ms | Lighthouse CI |
| Cumulative Layout Shift | < 0.1 | Lighthouse CI |
| Initial JS per route | < 180KB gzipped | bundlesize CI check |
| Hero image mobile | < 50KB | Build step |
| Thumbnail image | < 20KB | Build step |
| Lighthouse Performance score | > 90 | CI fail gate |
