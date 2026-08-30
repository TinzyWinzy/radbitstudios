import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { payoutService } from '@/services/payout.service';

const SIGNATURE_HEADER = 'x-signature';

/**
 * Verify an InnBucks webhook callback.
 *
 * Mirrors the signature scheme used for outbound disbursement requests
 * (see src/services/payout/providers/innbucks-payout.provider.ts):
 * SHA-256 hex digest of `<rawBody><INNBUCKS_API_SECRET>`, sent as X-Signature.
 *
 * Fail-closed: callbacks are rejected when the secret is not configured or
 * the signature is missing/invalid, rather than processed unverified.
 */
function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.INNBUCKS_API_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto
    .createHash('sha256')
    .update(rawBody + secret)
    .digest('hex');
  const received = signature.replace(/^sha256=/, '').toLowerCase();

  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get(SIGNATURE_HEADER);

    if (!verifySignature(rawBody, signature)) {
      if (!process.env.INNBUCKS_API_SECRET) {
        console.error('[InnBucks Webhook] INNBUCKS_API_SECRET not configured — rejecting callback');
        return NextResponse.json({ error: 'Webhook signature verification disabled' }, { status: 503 });
      }
      console.warn('[InnBucks Webhook] Invalid or missing signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const body = JSON.parse(rawBody);
    const { disbursementId, status, reference } = body;

    if (!disbursementId && !reference) {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    const providerRef = disbursementId || reference;

    if (status === 'completed' || status === 'sent') {
      const pendingPayouts = await payoutService.getByStatus('processing');
      const matched = pendingPayouts.filter((p) => p.providerRef === providerRef);
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