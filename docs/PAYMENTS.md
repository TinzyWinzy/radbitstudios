# Payment Engine — Radbit SME Hub

## Architecture

```
User Action (Subscribe / Buy Credits)
    │
    ▼
┌──────────────────────────────────────────────┐
│         Payment Orchestration Layer          │
│                                              │
│  1. Currency conversion (live rate fetch)    │
│  2. Route to PaymentProvider                 │
│  3. Initiate transaction                     │
│  4. Wait for webhook / poll                  │
│  5. Update subscription / credits ledger     │
│  6. Generate invoice                         │
│  7. Send notification (WhatsApp/Email)       │
└──────────────────────────────────────────────┘
    │
    ├── EcoCashProvider ─────► Econet API
    ├── OneMoneyProvider ────► NetOne API
    ├── PayNowProvider ──────► PayNow Zimbabwe
    ├── StripeProvider ──────► Stripe (cards)
    ├── PayFastProvider ─────► PayFast SA
    └── OzowProvider ───────► Ozow (instant EFT)
```

## PaymentProvider Interface

```typescript
// src/services/payment/providers/provider.interface.ts

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  userId: string;
  metadata?: Record<string, unknown>;
  returnUrl?: string;    // For redirect-based flows
  notifyUrl?: string;    // Webhook URL for async notifications
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  providerRef: string;    // Provider's transaction reference
  status: PaymentStatus;
  redirectUrl?: string;   // For redirect-based payments
  errorMessage?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentProvider {
  readonly name: string;
  readonly supportedCurrencies: string[];
  readonly supportedCountries: string[];

  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(providerRef: string): Promise<PaymentResponse>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse>;
  getBalance(): Promise<{ currency: string; available: number }>;
}
```

## Strategy Pattern — Provider Registry

```typescript
// src/services/payment/payment-orchestrator.ts

import { PaymentProvider } from './providers/provider.interface';

export class PaymentOrchestrator {
  private providers = new Map<string, PaymentProvider>();

  registerProvider(name: string, provider: PaymentProvider): void {
    this.providers.set(name, provider);
  }

  getProvider(country: string, currency: string): PaymentProvider {
    // Priority order: mobile money > card > EFT
    const countryPriority: Record<string, string[]> = {
      ZW: ['ecocash', 'onemoney', 'paynow', 'stripe'],
      ZA: ['payfast', 'stripe', 'ozow'],
      ZM: ['mtn_money', 'airtel_money', 'stripe'],
      BW: ['mtn_money', 'stripe'],
    };

    const priority = countryPriority[country] || ['stripe'];
    for (const name of priority) {
      const provider = this.providers.get(name);
      if (provider && provider.supportedCurrencies.includes(currency)) {
        return provider;
      }
    }
    throw new Error(`No provider available for ${country}/${currency}`);
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const provider = this.getProvider(request.metadata?.country as string || 'ZW', request.currency);
    return provider.initiatePayment(request);
  }
}
```

## Subscription Engine

```typescript
// src/services/payment/subscription.service.ts

export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'growth' | 'pro' | 'enterprise';
  priceUsd: number;
  priceZig: number;      // ZIG equivalent at current rate
  priceZar: number;
  billingPeriods: {
    monthly: number;     // base price
    quarterly: number;   // 10% discount
    annual: number;      // 25% discount
  };
  features: string[];
  aiCreditsPerMonth: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'free',
    priceUsd: 0,
    priceZig: 0,
    priceZar: 0,
    billingPeriods: { monthly: 0, quarterly: 0, annual: 0 },
    features: ['Assessment', '3 AI uses/month', 'Basic tenders', 'Community read-only'],
    aiCreditsPerMonth: 3,
  },
  {
    id: 'growth',
    name: 'growth',
    priceUsd: 5,
    priceZig: 5 * 350,   // 1 USD ≈ 350 ZIG (adjustable)
    priceZar: 5 * 18,     // 1 USD ≈ 18 ZAR
    billingPeriods: { monthly: 5, quarterly: 13.50, annual: 45 },
    features: ['Unlimited AI', 'Priority tender alerts', 'Community full access',
               '1 business plan/month', 'WhatsApp notifications', 'PDF reports'],
    aiCreditsPerMonth: 100,
  },
  {
    id: 'pro',
    name: 'pro',
    priceUsd: 15,
    priceZig: 15 * 350,
    priceZar: 15 * 18,
    billingPeriods: { monthly: 15, quarterly: 40.50, annual: 135 },
    features: ['Everything in Growth', 'Unlimited business plans', 'Cash flow tools',
               'Compliance calendar', 'Supplier directory', 'Priority support',
               'AI Mentor unlimited', 'Custom branding on reports'],
    aiCreditsPerMonth: 500,
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    priceUsd: 0,  // Custom pricing
    priceZig: 0,
    priceZar: 0,
    billingPeriods: { monthly: 0, quarterly: 0, annual: 0 },
    features: ['Everything in Pro', 'White-label', 'API access',
               'Bulk user management', 'Dedicated account manager',
               'Custom integrations', 'SLA guarantee'],
    aiCreditsPerMonth: 5000,
  },
];

// Subscription lifecycle state machine
export type SubscriptionState =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired';

export type SubscriptionEvent =
  | 'INITIALIZE'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'CANCEL'
  | 'REACTIVATE'
  | 'EXPIRED';

export const subscriptionTransitions: Record<SubscriptionState, Partial<Record<SubscriptionEvent, SubscriptionState>>> = {
  trialing:   { PAYMENT_SUCCESS: 'active', CANCEL: 'canceled', EXPIRED: 'expired' },
  active:     { PAYMENT_FAILED: 'past_due', CANCEL: 'canceled', PAYMENT_SUCCESS: 'active' },
  past_due:   { PAYMENT_SUCCESS: 'active', PAYMENT_FAILED: 'past_due', EXPIRED: 'expired' },
  canceled:   { REACTIVATE: 'active', EXPIRED: 'expired' },
  expired:    { REACTIVATE: 'active' },
};
```

## Dunning Management

```typescript
// src/services/payment/dunning.service.ts

interface DunningStep {
  delayHours: number;
  channel: 'whatsapp' | 'email' | 'sms';
  template: string;
}

const DUNNING_FLOW: DunningStep[] = [
  { delayHours: 24, channel: 'whatsapp',  template: 'payment_failed_24h' },
  { delayHours: 48, channel: 'whatsapp',  template: 'payment_failed_48h' },
  { delayHours: 72, channel: 'sms',       template: 'payment_failed_72h' },
  // After 72h: subscription moved to past_due → expires at end of billing period
];

export class DunningService {
  async processFailedPayment(userId: string, subscriptionId: string): Promise<void> {
    const attempts = await this.getAttemptCount(userId);

    if (attempts >= DUNNING_FLOW.length) {
      // Final step: expire subscription
      await this.expireSubscription(subscriptionId);
      await this.notificationService.send(userId, {
        channel: 'whatsapp',
        template: 'subscription_expired',
        data: { resumeLink: `${FRONTEND_URL}/settings/subscription` },
      });
      return;
    }

    const step = DUNNING_FLOW[attempts];
    await this.notificationService.send(userId, {
      channel: step.channel,
      template: step.template,
      data: {
        daysRemaining: this.getDaysRemaining(subscriptionId),
        retryLink: `${FRONTEND_URL}/settings/payment`,
      },
    });

    // Schedule next retry
    await this.scheduleRetry(userId, subscriptionId, step.delayHours);
  }
}
```

## Webhook Handling

```typescript
// src/services/payment/webhooks/webhook-handler.ts

// Idempotency: Use provider's idempotency key + transaction ID
// Store processed webhook IDs in Redis with 7-day TTL

export class WebhookHandler {
  private processedIds = new Set<string>();  // Backed by Redis

  async handleWebhook(provider: string, payload: unknown): Promise<void> {
    const event = this.normalizeEvent(provider, payload);

    // Idempotency check
    if (this.processedIds.has(event.id)) {
      return { status: 'duplicate', eventId: event.id };
    }

    // Validate signature
    if (!this.verifySignature(provider, payload)) {
      throw new Error('Invalid webhook signature');
    }

    this.processedIds.add(event.id);

    switch (event.type) {
      case 'payment.completed':
        await this.handlePaymentCompleted(event);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(event);
        break;
      case 'subscription.renewed':
        await this.handleSubscriptionRenewed(event);
        break;
      case 'payment.refunded':
        await this.handleRefund(event);
        break;
    }

    return { status: 'processed', eventId: event.id };
  }

  private normalizeEvent(provider: string, payload: any): NormalizedEvent {
    // Each provider has its own payload format
    const normalizers: Record<string, (p: any) => NormalizedEvent> = {
      ecocash: this.normalizeEcoCash,
      stripe: this.normalizeStripe,
      payfast: this.normalizePayFast,
    };
    return normalizers[provider](payload);
  }
}
```

## Admin Dashboard Metrics

```sql
-- MRR (Monthly Recurring Revenue)
SELECT
  DATE_TRUNC('month', created_at) AS month,
  SUM(CASE WHEN plan = 'growth' THEN 5
           WHEN plan = 'pro' THEN 15
           ELSE 0 END) AS mrr_usd,
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'active') AS active_subscribers
FROM subscriptions
WHERE status IN ('active', 'past_due')
GROUP BY month
ORDER BY month DESC;

-- Churn Rate
WITH monthly AS (
  SELECT
    DATE_TRUNC('month', created_at) AS cohort_month,
    COUNT(DISTINCT user_id) AS new_subs
  FROM subscriptions
  GROUP BY cohort_month
),
cancelled AS (
  SELECT
    DATE_TRUNC('month', updated_at) AS cancel_month,
    COUNT(DISTINCT user_id) AS churned
  FROM subscriptions
  WHERE status = 'canceled'
  GROUP BY cancel_month
)
SELECT
  m.cohort_month,
  m.new_subs,
  COALESCE(c.churned, 0) AS churned,
  ROUND(COALESCE(c.churned, 0) * 100.0 / NULLIF(m.new_subs, 0), 2) AS churn_rate_pct
FROM monthly m
LEFT JOIN cancelled c ON m.cohort_month = c.cancel_month
ORDER BY m.cohort_month DESC;

-- LTV by Country
SELECT
  u.country_code,
  COUNT(DISTINCT s.user_id) AS subscribers,
  AVG(i.amount) AS avg_revenue_per_user,
  AVG(DATEDIFF('day', s.created_at, COALESCE(s.current_period_end, NOW()))) AS avg_lifetime_days
FROM subscriptions s
JOIN users u ON s.user_id = u.id
LEFT JOIN invoices i ON i.user_id = u.id
WHERE s.status = 'active'
GROUP BY u.country_code;
```

## Integration Tests

```typescript
// src/__tests__/payment.test.ts

import { describe, it, expect, vi } from 'vitest';
import { PaymentOrchestrator } from '@/services/payment/payment-orchestrator';
import { EcoCashProvider } from '@/services/payment/providers/ecocash.provider';

describe('PaymentOrchestrator', () => {
  it('routes Zimbabwe USD payments to EcoCash', async () => {
    const orchestrator = new PaymentOrchestrator();
    const mockEcoCash = new EcoCashProvider();
    vi.spyOn(mockEcoCash, 'initiatePayment').mockResolvedValue({
      success: true,
      transactionId: 'txn-123',
      providerRef: 'ecocash-ref-456',
      status: 'pending',
    });
    orchestrator.registerProvider('ecocash', mockEcoCash);

    const result = await orchestrator.initiatePayment({
      amount: 5,
      currency: 'USD',
      description: 'Growth Plan - Monthly',
      reference: 'sub-growth-001',
      userId: 'user-001',
      metadata: { country: 'ZW' },
    });

    expect(result.success).toBe(true);
    expect(result.providerRef).toBe('ecocash-ref-456');
  });

  it('falls back to Stripe for unsupported country', async () => {
    // ...
  });

  it('throws error when no provider available', async () => {
    // ...
  });
});

describe('Subscription Lifecycle', () => {
  it('transitions from trialing to active on payment success', () => { /* ... */ });
  it('transitions from active to past_due on payment failure', () => { /* ... */ });
  it('applies quarterly discount correctly', () => { /* ... */ });
  it('prorates upgrade mid-cycle', () => { /* ... */ });
  it('executes dunning flow on failed payment', () => { /* ... */ });
});

describe('Invoice Generation', () => {
  it('generates ZIMRA-compliant invoice number', () => { /* ... */ });
  it('applies 15% VAT for Zimbabwe transactions', () => { /* ... */ });
  it('includes exchange rate snapshot', () => { /* ... */ });
});
```

## AdSense Integration

```typescript
// src/components/adsense/ad-unit.tsx

'use client';
import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical';
  className?: string;
}

export function AdUnit({ slot, format = 'auto', className }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    // Lazy load when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loaded.current) {
            loaded.current = true;
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            } catch {}
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (adRef.current) observer.observe(adRef.current);
    return () => observer.disconnect();
  }, []);

  // Ad blocker detection
  useEffect(() => {
    const checkAdBlocker = setTimeout(() => {
      const ad = adRef.current;
      if (ad && ad.offsetHeight === 0) {
        // Show polite ad-blocker message
        const msg = document.createElement('div');
        msg.className = 'ad-blocker-message';
        msg.textContent = 'Please whitelist Radbit SME Hub to support free content.';
        ad.appendChild(msg);
      }
    }, 3000);
    return () => clearTimeout(checkAdBlocker);
  }, []);

  return (
    <div ref={adRef} className={`ad-container ${className || ''}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-xxxxx"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
```
