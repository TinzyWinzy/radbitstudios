import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';
import { verifySession } from '@/lib/api-auth';

/**
 * POST /api/payments
 *
 * Actions:
 *   create-subscription   — init subscription + invoice
 *   cancel-subscription   — cancel by subscription id
 *   retry-payment         — retry failed payment
 *   initiate-payment      — one-off payment via PaymentOrchestrator
 *
 * Rate-limit: 20/min per IP + per-user budget checks inside handler.
 */
export const POST = withIpRateLimit(
  RateLimits.payments,
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const user = await verifySession(req);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { action } = body;

      switch (action) {
        case 'create-subscription': {
          const { SubscriptionEngine } = await import('@/services/payment/subscription-engine');
          const engine = new SubscriptionEngine();
          const { plan, billingPeriod, country, currency } = body;
          const result = await engine.createSubscription(
            user.uid,
            plan,
            billingPeriod,
            country,
            currency,
          );
          return NextResponse.json(result);
        }

        case 'cancel-subscription': {
          const { SubscriptionEngine } = await import('@/services/payment/subscription-engine');
          const engine = new SubscriptionEngine();
          const { subscriptionId, immediately } = body;
          await engine.cancelSubscription(subscriptionId, immediately);
          return NextResponse.json({ success: true });
        }

        case 'retry-payment': {
          const { SubscriptionEngine } = await import('@/services/payment/subscription-engine');
          const engine = new SubscriptionEngine();
          const { subscriptionId } = body;
          const result = await engine.retryPayment(subscriptionId);
          return NextResponse.json(result);
        }

        case 'initiate-payment': {
          const { PaymentOrchestrator } = await import('@/services/payment/payment-orchestrator');
          const payments = new PaymentOrchestrator();
          const { amount, currency, description, reference, metadata } = body;
          const result = await payments.initiatePayment({
            amount,
            currency,
            description,
            reference,
            userId: user.uid,
            metadata,
          });
          return NextResponse.json(result);
        }

        default:
          return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
      }
    } catch (error: any) {
      console.error('Payment API error:', error);
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: error.status === 429 ? 429 : 500 },
      );
    }
  },
);

/**
 * PATCH /api/payments
 *
 * Webhook receiver for payment providers.
 * Rate-limited by provider HMAC — idempotent, accepts multiple retries from providers.
 * No IP rate limit here (providers retry from their IPs on failure).
 */
export async function PATCH(req: NextRequest) {
  const provider = req.headers.get('x-payment-provider') || 'stripe';
  const { WebhookHandler } = await import('@/services/payment/webhook-handler');
  const handler = new WebhookHandler();
  const rawBody = await req.text();
  const payload = JSON.parse(rawBody);
  const result = await handler.handle(provider, payload);
  return NextResponse.json(result);
}
