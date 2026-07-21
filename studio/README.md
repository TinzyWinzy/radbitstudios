# Radbit Studios — SME Hub Platform

> Enterprise-grade digital infrastructure for Zimbabwean SMEs, diaspora investors, and government tender workflows.

## Project Overview

Radbit Studios is the core platform product of Radbit Studios Pvt Ltd. It combines AI-assisted business advisory, ZIMRA/PRAZ compliance automation, tender discovery, and client project management into a single Next.js 14 application.

The platform serves three distinct audiences:
- **Zimbabwean SMEs** — Daily operations, tenders, compliance, and AI mentorship
- **Diaspora investors** — Overseas business formation, investment workflows, and escrow management
- **Enterprise clients** — Custom software, cybersecurity, ERP, and AI platform delivery

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript 5 |
| **Styling** | Tailwind CSS 3, Radix UI, Framer Motion |
| **Backend** | Next.js API Routes, Firebase Admin, Genkit AI |
| **Database** | Firebase Firestore (primary), Supabase PostgreSQL (secondary) |
| **Auth** | Firebase Auth with custom role-based access control |
| **AI** | Genkit + Gemini (primary), OpenAI, Anthropic |
| **Email** | Nodemailer + Gmail SMTP / Resend |
| **Payments** | Stripe, PayNow Zimbabwe, EcoCash, PayFast, Inabucks |
| **WhatsApp** | Meta WhatsApp Cloud API |
| **Push** | Web Push (VAPID) |
| **Testing** | Vitest (unit), Playwright (E2E), Jest DOM |
| **Linting** | ESLint, Prettier, Husky + lint-staged |
| **Observability** | Sentry, OpenTelemetry, Lighthouse CI |
| **Hosting** | Firebase App Hosting / Vercel |
| **CI/CD** | GitHub Actions (5 workflows) |

## Repository Structure

```
studio/
├── src/
│   ├── app/                    # Next.js pages and API routes
│   │   ├── [locale]/           # Localized marketing, app, and dashboard routes
│   │   ├── api/                # Serverless API routes
│   │   ├── sitemap.ts          # Dynamic SEO sitemap
│   │   └── robots.ts           # Crawler rules
│   ├── components/             # Reusable UI components
│   │   ├── marketing-*.tsx     # Marketing-specific components
│   │   ├── dashboard-*.tsx     # Admin/dashboard components
│   │   ├── analytics/          # GA4 and tracking
│   │   ├── animations/         # Scroll-reveal, interactive cards
│   │   └── editor/             # Rich-text and content editors
│   ├── services/               # Business logic layer
│   │   ├── ai/                 # Genkit flows and AI gateway
│   │   ├── whatsapp/           # WhatsApp handler, session store, outbound queue
│   │   ├── email-service.ts    # SMTP email delivery
│   │   ├── project-service*.ts # Project lifecycle management
│   │   ├── onboarding-engine.ts
│   │   ├── rate-limiter.ts     # Upstash + Firestore rate limiting
│   │   └── notifications/      # In-app and push notifications
│   ├── lib/                    # Shared utilities and helpers
│   │   ├── firebase/           # Firebase client and admin initialization
│   │   ├── api-validation.ts   # Central Zod schemas for all API routes
│   │   ├── csp-nonce.ts        # Security headers
│   │   └── upstash-ratelimit.ts
│   ├── data/                   # Static data and reference arrays
│   ├── types/                  # TypeScript interfaces
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # React context providers
│   ├── ai/                     # Genkit flow definitions
│   ├── messages/               # i18n translation files
│   └── __tests__/              # Vitest unit tests
├── public/                     # Static assets
├── scripts/                    # Seed and migration scripts
├── e2e/                        # Playwright end-to-end tests
├── docs/                       # Additional documentation
├── data/                       # Local SQLite / RAG knowledge index
├── firestore.rules             # Firebase security rules
├── storage.rules               # Firebase Storage security rules
├── playwright.config.ts
├── vitest.config.ts
├── tsconfig.json
├── package.json
└── AGENTS.md                   # Repository guidelines for AI agents
```

## Key Features

### Marketing & SEO
- **Programmatic SEO**: 15 industry pages (`/solutions/[slug]`) and 20 use-case pages (`/use-cases/[slug]`) in Firestore
- **Blog**: 25+ posts, full editorial workflow, Firestore-backed with admin editor
- **Sitemap & Robots**: Dynamic generation via `app/sitemap.ts` and `app/robots.ts`
- **JSON-LD**: Organization, Service, HowTo, FAQPage, Article, BreadcrumbList schemas
- **AdSense**: 4 lazy-loaded ad components (banner, in-article, matched-content)
- **Newsletter**: Subscription/unsubscription API with Resend email delivery
- **Lead Magnets**: ZIMRA Tax Calendar, Diaspora Investment Checklist

### Business Logic
- **Lead Management**: Multi-form lead capture (`/contact`, `/pilot`, `/consultancy`, diagnostic tools) → `POST /api/leads`
- **Project Pipeline**: Status-based workflow (lead → onboarding → design → development → review → live → completed)
- **Onboarding Checklists**: AI-generated from user persona and project type
- **WhatsApp Automation**: Local business mentor, tender search, ZIMRA tax assistant, fiscal device management
- **Payment Stack**: PayNow, Stripe, EcoCash, PayFast, Inabucks integrations
- **B2B Diaspora**: Investment workflows, escrow management, SME verification

### AI & Automation
- **Genkit Flows**: Onboarding checklist generation, onboarding email copy, lead intake classification, newsletter dispatch
- **AI Gateway**: Multi-model abstraction (Gemini, OpenAI, Anthropic)
- **Semantic Cache**: Firestore-backed AI response cache
- **RAG Pipeline**: Vector-based knowledge retrieval for business advisory

### Infrastructure
- **Rate Limiting**: Upstash Redis (primary) → Firestore transaction fallback
- **Session Management**: Firebase Auth with custom role claims (sme_owner, sme_staff, admin, super_admin)
- **Push Notifications**: Web Push Protocol via VAPID
- **Scrapers**: Tender and news scraping with scheduled GitHub Actions
- **Sentry**: Error tracking and performance monitoring

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Firebase project with Auth, Firestore, and Storage enabled
- Supabase project (PostgreSQL)
- Google AI API key (Gemini)
- SMTP credentials (Gmail App Password recommended)
- WhatsApp Cloud API credentials (Meta)

### Installation

```bash
# Clone the repository
git clone https://github.com/TinzyWinzy/radbitstudios.git
cd studio

# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Start development server on port 9002
npm run dev
```

The app will be available at `http://localhost:9002`.

### Environment Variables

All secrets and credentials are managed via `.env.local`. Never commit this file.

#### Required
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web App ID |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase public API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
| `GEMINI_API_KEY` | Google Generative AI key (required for AI features) |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `SMTP_USER` | Outbound email address |
| `SMTP_PASS` | Email app password or SMTP password |

#### Optional
| Variable | Description |
|----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Inline JSON service account for Admin SDK |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON file |
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp Cloud API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business Phone Number ID |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments |
| `PAYNOW_INTEGRATION_ID` / `PAYNOW_INTEGRATION_KEY` | PayNow Zimbabwe |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis for rate limiting |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Alternative AI providers |
| `VAPID_PRIVATE_KEY` | Web Push VAPID key pair |
| `ADMIN_WHATSAPP` | WhatsApp number for lead notifications |

See `.env.example` for the full list.

## Scripts

```bash
# Development
npm run dev                   # Start dev server on port 9002
npm run genkit:dev            # Start Genkit AI dev UI
npm run genkit:watch          # Start Genkit with file watching

# Build & Deploy
npm run build                 # Production build
npm run start                 # Start production server
npm run analyze               # Bundle analysis

# Code Quality
npm run lint                  # Run ESLint
npm run lint:fix              # Auto-fix lint errors
npm run format                # Check Prettier formatting
npm run format:fix            # Auto-fix formatting
npm run typecheck             # Run TypeScript compiler (no emit)

# Testing
npm run test                  # Run Vitest unit tests
npm run test:watch            # Run Vitest in watch mode
npm run test:e2e              # Run Playwright E2E tests
npm run test:pwa              # Run PWA certification tests
npm run lighthouse            # Run Lighthouse CI audits

# Utilities
npm run rag:index             # Index RAG knowledge base
npm run rag:list              # List indexed RAG documents
```

## Architecture

### Client-Server Boundary
- **Server Components**: All page-level components in `src/app/` are React Server Components by default.
- **Client Components**: Interactive components use the `"use client"` directive.
- **API Routes**: All mutation logic lives in `src/app/api/` with rate limiting, Zod validation, and error handling.

### Data Flow
1. **Marketing pages** (public) → Pre-rendered at build time or edge-cached.
2. **App pages** (authenticated) → Server Components with client hydration for interactivity.
3. **Dashboard pages** → RPC-style API routes with Firestore as the source of truth.
4. **AI features** → Client calls `POST /api/ai/generate` or uses Genkit flows directly from server components.

### Security
- **Firebase Security Rules**: Deny-by-default. Server-side operations use Admin SDK entirely.
- **Rate Limiting**: Every public API route is wrapped with `withIpRateLimit`. Fallback to Firestore for cold-start protection.
- **Input Validation**: All mutations validated via Zod schemas in `src/lib/api-validation.ts`.
- **CSP Headers**: Dynamic nonces generated in `src/lib/csp-nonce.ts`.
- **Secrets**: All credentials in `.env.local`. Service account keys never committed.

### Localization
- Framework: `next-intl`
- Paths: `src/messages/`
- Marketing pages and app UI are fully localized.

## Testing Strategy

- **Vitest**: Unit tests for services, API route handlers, and React components.
- **Playwright**: E2E tests for critical user journeys (PWA install, lead form, dashboard flows).
- **Coverage**: V8 provider with thresholds for `src/lib/`, `src/services/`, `src/hooks/`.
- **Headless CI**: Vitest and Playwright run in GitHub Actions.

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Run specific test file
npx vitest run src/__tests__/leads-route.test.ts
```

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push / PR | Lint, typecheck, unit tests, Playwright E2E |
| `preview.yml` | Push to branches | Vercel preview deployment |
| `scrape-tenders.yml` | Cron | Zimbabwe tender scraper |
| `scrape-news.yml` | Cron | Business news scraper |
| `security-scan.yml` | Schedule | Snyk dependency audit |
| `uptime.yml` | Cron | External endpoint monitoring |

## Deployment

- **Staging/Preview**: Vercel (automatic via GitHub Actions on PRs)
- **Production**: Firebase App Hosting or Vercel (`main` branch)
- **Environment**: Production secrets managed in hosting platform Vault / environment config.
- **Edge**: Dynamic routes and API routes deployed as edge functions where compatible.

## Observability

- **Sentry**: `@sentry/nextjs` with source maps. Capture exceptions and performance from both client and server.
- **GA4**: `NEXT_PUBLIC_GA_ID` + `GA4Script` in root layout + SPA page view observer.
- **OpenTelemetry**: Trace export via `@opentelemetry/exporter-trace-otlp-http`.
- **Lighthouse**: Threshold checks on performance, accessibility, SEO, and PWA metrics.

## Contributing

1. Create a feature branch from `main`.
2. Make small, focused changes preserving existing architecture.
3. Keep business logic in `src/services/` or `src/lib/` — do not duplicate across pages.
4. Add or update tests for changed behavior.
5. Run `npm run lint`, `npm run typecheck`, and `npm run test` before pushing.
6. Open a PR targeting `main`.
7. Wait for CI green and code review approval.

### Commit Conventions

```
<type>: <subject>

- fix: lead form submission pipeline
- feat: add diaspora investment checker
- refactor: consolidate rate-limit providers
- docs: update onboarding checklist README
- test: add regression for budget parsing
```

## License

Proprietary — Radbit Studios Pvt Ltd. All rights reserved.
