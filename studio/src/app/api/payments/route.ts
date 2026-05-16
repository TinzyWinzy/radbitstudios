import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/services/rate-limiter';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = rateLimit(`payments:${ip}`, { maxRequests: 20, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.retryAfter) },
    });
  }

  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'create-subscription': {
        const { SubscriptionEngine } = await import('@/services/payment/subscription-engine');
        const engine = new SubscriptionEngine();
        const { userId, plan, billingPeriod, country, currency } = body;
        const result = await engine.createSubscription(userId, plan, billingPeriod, country, currency);
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
        const { amount, currency, description, reference, userId, metadata } = body;
        const result = await payments.initiatePayment({ amount, currency, description, reference, userId, metadata });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const provider = req.headers.get('x-payment-provider') || 'stripe';
  const { WebhookHandler } = await import('@/services/payment/webhook-handler');
  const handler = new WebhookHandler();
  const rawBody = await req.text();
  const payload = JSON.parse(rawBody);
  const result = await handler.handle(provider, payload);
  return NextResponse.json(result);
}
