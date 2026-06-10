import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';
import { verifySession } from '@/lib/api-auth';
import { validateBody, PaymentActionSchema } from '@/lib/api-validation';

export const POST = withIpRateLimit(
  RateLimits.payments,
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const user = await verifySession(req);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const validation = await validateBody(req, PaymentActionSchema);
      if (!validation.success) return validation.response;

      const action = validation.data;

      switch (action.action) {
        case 'create-subscription': {
          const { SubscriptionEngine } = await import('@/services/payment/subscription-engine');
          const engine = new SubscriptionEngine();
          const result = await engine.createSubscription(
            user.uid,
            action.plan,
            action.billingPeriod,
            action.country,
            action.currency,
          );
          return NextResponse.json(result);
        }

        case 'cancel-subscription': {
          const { SubscriptionEngine } = await import('@/services/payment/subscription-engine');
          const engine = new SubscriptionEngine();
          await engine.cancelSubscription(action.subscriptionId, action.immediately);
          return NextResponse.json({ success: true });
        }

        case 'retry-payment': {
          const { SubscriptionEngine } = await import('@/services/payment/subscription-engine');
          const engine = new SubscriptionEngine();
          const result = await engine.retryPayment(action.subscriptionId);
          return NextResponse.json(result);
        }

        case 'initiate-payment': {
          const { PaymentOrchestrator } = await import('@/services/payment/payment-orchestrator');
          const payments = new PaymentOrchestrator();
          const result = await payments.initiatePayment({
            amount: action.amount,
            currency: action.currency,
            description: action.description || 'Payment',
            reference: action.reference || `pay-${Date.now()}`,
            userId: user.uid,
            metadata: action.metadata || {},
          });
          return NextResponse.json(result);
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Payment API error:', message);
      return NextResponse.json(
        { error: message || 'Internal server error' },
        { status: (error as { status?: number })?.status === 429 ? 429 : 500 },
      );
    }
  },
);

export const PATCH = withIpRateLimit(
  { maxRequests: 30, windowMs: 60 * 1000, keyPrefix: 'ratelimit:payments-webhook' },
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const provider = req.headers.get('x-payment-provider') || 'stripe';
      const { WebhookHandler } = await import('@/services/payment/webhook-handler');
      const handler = new WebhookHandler();
      const rawBody = await req.text();
      const payload = JSON.parse(rawBody);
      const result = await handler.handle(provider, payload);
      return NextResponse.json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Webhook processing failed';
      console.error('[Payments] Webhook error:', message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);
