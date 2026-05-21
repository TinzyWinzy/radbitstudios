import { NextRequest, NextResponse } from 'next/server';
import { PayNowProvider } from '@/services/payment/providers/paynow.provider';
import { WebhookHandler } from '@/services/payment/webhook-handler';

/**
 * POST /api/webhooks/paynow
 *
 * PayNow sends Instant Transaction Notifications (ITN) here as
 * application/x-www-form-urlencoded POST requests after a payment.
 *
 * We verify the ITN hash, then process via the shared WebhookHandler.
 */
export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const payload = Object.fromEntries(new URLSearchParams(text));

    // Verify ITN hash
    const provider = new PayNowProvider();
    if (!provider.verifyITNHash(payload)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Process via shared handler (maps to paynow provider internally)
    const handler = new WebhookHandler();
    const result = await handler.handle('paynow', payload);

    return NextResponse.json(result);
  } catch (error) {
    console.error('PayNow webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
