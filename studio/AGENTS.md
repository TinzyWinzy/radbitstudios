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

## Notes for this repo
- Plan values should be normalized to the canonical display format: Free, Growth, Tender Starter, Pro, Enterprise.
- Subscription and feature-gating logic should use the same plan source of truth.
- Environment variables and credentials should stay in local files such as .env.local and not be committed.
