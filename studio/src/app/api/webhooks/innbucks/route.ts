import { NextRequest, NextResponse } from 'next/server';
import { payoutService } from '@/services/payout.service';

/**
 * InnBucks webhook endpoint for payout status updates.
 * InnBucks sends callbacks when a disbursement status changes.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { disbursementId, status, reference } = body;

    if (!disbursementId && !reference) {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    // Find the payout by providerRef or reference prefix
    const providerRef = disbursementId || reference;

    if (status === 'completed' || status === 'sent') {
      const pendingPayouts = await payoutService.getByStatus('processing');
      const matched = pendingPayouts.filter(p =>
        p.providerRef === providerRef || p.id?.startsWith(typeof providerRef === 'string' ? providerRef.slice(0, 8) : '')
      );
      for (const payout of matched) {
        if (payout.id) {
          await payoutService.updateStatus(payout.id, 'sent', providerRef);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('[InnBucks Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
