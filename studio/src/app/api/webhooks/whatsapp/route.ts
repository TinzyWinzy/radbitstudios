import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { handleIncomingMessage } from '@/services/whatsapp/whatsapp-handler';

function verifySignature(payload: string, signature: string): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signature) return false;
  const expected = crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
  const received = signature.replace('sha256=', '');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256') || '';

    if (!verifySignature(rawBody, signature)) {
      console.warn('[WhatsApp] Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value?.messages) continue;

        for (const msg of value.messages) {
          const phoneNumber = value.metadata?.display_phone_number || '';
          const phoneNumberId = value.metadata?.phone_number_id || '';
          const from = msg.from;
          const msgType = msg.type;

          let text = '';
          if (msgType === 'text') {
            text = msg.text?.body || '';
          }

          if (text) {
            await handleIncomingMessage(from, text, phoneNumber, phoneNumberId);
          }
        }
      }
    }

    return NextResponse.json({ status: 'processed' });
  } catch (error) {
    console.error('[WhatsApp] Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
