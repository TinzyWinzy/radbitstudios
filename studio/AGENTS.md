# Repository Guidelines

## Project overview
- This repository is a Next.js 14 application for Radbit SME Hub.
- Primary stack: React, TypeScript, Next.js, Firebase, Genkit, Tailwind CSS, Vitest, Playwright.

## Working rules
- Prefer small, targeted changes that preserve existing architecture.
- Keep business logic centralized in services or shared libraries rather than duplicating it across pages.
- When changing plan, billing, feature access, or usage logic, update the shared logic and regression tests together.
- Preserve localization and user-facing copy patterns.
- Do not commit secrets or credential material; keep them in local environment files.

## Validation
- Run the relevant Vitest suite for the feature you changed.
- If changing shared logic, run the related business-logic tests.
- Keep TypeScript errors from newly introduced code to a minimum and avoid widening existing issues.

## Traffic & SEO
- **AdSense**: `ca-pub-8600120936743760`, 4 components (`adsense.tsx`, `ad-banner.tsx`, `in-article-ad.tsx`, `matched-content.tsx`), lazy-loaded via IntersectionObserver.
- **GA4**: Via `NEXT_PUBLIC_GA_ID` env var. `GA4Script` in root layout. SPA page view tracking via `GA4PageView`.
- **Blog**: Firebase-backed (`blog_posts` collection), 25 seed posts (10 original + 15 diaspora-targeted). Seed script at `scripts/seed-blog-posts.ts` and `scripts/seed-diaspora-blog-posts.ts`.
- **Programmatic SEO**: 15 industry pages (`/solutions/[slug]`) + 20 use case pages (`/use-cases/[slug]`) — all stored in Firestore `seo_pages` collection. Seed script at `scripts/seed-seo-pages.ts`. Schema: `Service` for industries, `HowTo` for use cases.
- **Newsletter**: Firestore-backed (`newsletter_subscribers` collection). API at `POST /api/newsletter/subscribe` (public, no auth). `POST /api/newsletter/unsubscribe`. Resend for email delivery. Signup component at `components/newsletter-signup.tsx` with 3 variants (inline, card, banner).
- **Lead Magnets**: ZIMRA Tax Calendar at `/guides/zimra-tax-calendar-2026`. Newsletters offer lead magnets on subscribe (ZIMRA Tax Deadline Calendar, Diaspora Investment Checklist).
- **Programmatic SEO data**: Static reference in `data/seo-pages.ts` (6 industries + 4 use cases). Firestore `seo_pages` collection has the full set.
- **Diaspora traffic**: 3 diaspora landing pages (`/diaspora`, `/diaspora/invest`, `/diaspora/start-business`) + 15 diaspora blog posts. Target keywords: "invest in Zimbabwe from UK", "diaspora investment Zimbabwe", "Zimbabwe business from abroad", etc.
- **Sitemap**: Dynamic at `app/sitemap.ts` — includes static pages, blog posts, guides, SEO pages, threat assessments.
- **Robots**: Googlebot-specific allow rules in `app/robots.ts`. Add new public pages to both sitemap and robots.
- **JSON-LD**: 7+ schema types (Organization, WebSite, LocalBusiness, FAQPage, AggregateRating, BreadcrumbList, Article, Service, HowTo, WebPage).
- **Lead Magnet pages**: Static guide pages at `/guides/[slug]` — add to sitemap and robots when created.

## Notes for this repo
- Plan values should be normalized to the canonical display format: Free, Growth, Tender Starter, Pro, Enterprise.
- Subscription and feature-gating logic should use the same plan source of truth.
- Environment variables and credentials should stay in local files such as .env.local and not be committed.
