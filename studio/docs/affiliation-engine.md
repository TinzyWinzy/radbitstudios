# Affiliation Engine — Radbit Revenue Network

## Objective

Turn people who already have trust into a sales channel.

Instead of "we find clients", create **Zimbabwe's digital business referral infrastructure**.

## Core Model

```
Partner → Radbit → Client
```

Partner brings opportunity. Radbit closes + delivers. Partner earns commission.

## Partner Portal (PWA)

Route: `/partners`

Features:
- Signup
- Referral link
- Dashboard
- Earnings
- Leads
- Status

## Referral Identity

Format: `radbitstudios.co.zw/?ref=RBT001`

Stored on partner doc:
- `uid` (Firebase Auth ref)
- `name`
- `email`
- `commissionRate`
- `referralCode`

## Lead Attribution

When a visitor arrives with `?ref=`:
- Capture: `ref_code`, `landing_page`, `timestamp`, `device`
- Set cookie: `radbit_ref=RBT001`
- Duration: 90 days
- On signup: attribute client to partner

## Commission Engine

Example: $500 website package at 10% = $50 commission.

States: `pending` → `approved` → `paid`

## Partner Tiers

| Tier | Clients | Rate |
|------|---------|------|
| Scout | 0–5 | 10% |
| Builder | 6–20 | 15% |
| Alliance | 20+ | 20% |

## Target Partners

1. Designers (need backend/AI/blockchain delivery)
2. Marketing agencies (need delivery capacity)
3. Accountants (know SMEs)
4. Tourism consultants (perfect overlap with Radbit)
5. IT technicians (find businesses)

## Partner Copilot (AI)

Input: "Restaurant in Harare"
Output: pitch, offer, estimated price, WhatsApp message

## Architecture

```text
Frontend:  Next.js PWA
Backend:   Firebase (Firestore)
AI:        Gemini (via existing Genkit agent system)
Payments:  EcoCash, PayNow, Bank, Crypto rails (future)
```

## Firestore Collections

- `partners` — partner profiles, tiers, earnings
- `referrals` — click attribution, 90-day window
- `commissions` — earned commissions per client
- `payouts` — payout requests and history

## Strategic Layer

Tourism Intelligence OS + Affiliate Engine = **Radbit Revenue Network**

## Build Order

1. Firestore schema + types
2. Partner portal (distribution)
3. Lead attribution (tracking)
4. Commission engine (money)
5. Payout system (pay)
6. Partner tiers (gamify)
7. Partner Copilot (AI)
8. Admin panel (manage)
