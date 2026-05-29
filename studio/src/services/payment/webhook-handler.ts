import crypto from 'crypto';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { PayNowProvider } from './providers/paynow.provider';
import { paymentConfirmationEmail, sendEmail } from '@/services/email-service';

export class WebhookHandler {
  async handle(provider: string, rawPayload: any): Promise<{ status: 'processed' | 'duplicate' | 'ignored'; eventId?: string }> {
    const event = this.normalize(provider, rawPayload);

    if (!event) return { status: 'ignored' };

    // Idempotency: check if already processed
    const idempotencyRef = adminDb.doc(`webhook_events/${event.id}`);
    const existing = await idempotencyRef.get();
    if (existing.exists) return { status: 'duplicate', eventId: event.id };

    // Validate signature
    if (!this.verifySignature(provider, rawPayload)) {
      console.error(`[WebhookHandler] Invalid webhook signature from ${provider}`);
      return { status: 'ignored' };
    }

    // Process
    try {
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
        default:
          console.warn(`[WebhookHandler] Unknown webhook event type: ${event.type}`);
      }

      // Mark as processed
      await idempotencyRef.set({
        id: event.id,
        provider,
        type: event.type,
        payload: rawPayload,
        processedAt: new Date(),
      });

      return { status: 'processed', eventId: event.id };
    } catch (error) {
      console.error(`[WebhookHandler] Processing failed:`, error);
      throw error;
    }
  }

  private normalize(provider: string, payload: any): { id: string; type: string; data: any } | null {
    switch (provider) {
      case 'stripe': {
        const event = payload as { id: string; type: string; data: { object: any } };
        const typeMap: Record<string, string> = {
          'checkout.session.completed': 'payment.completed',
          'checkout.session.expired': 'payment.failed',
          'invoice.paid': 'payment.completed',
          'invoice.payment_failed': 'payment.failed',
          'customer.subscription.updated': 'subscription.renewed',
        };
        return { id: event.id, type: typeMap[event.type] || event.type, data: event.data.object };
      }
      case 'ecocash': {
        return { id: payload.transactionId || payload.id, type: payload.status === 'completed' ? 'payment.completed' : 'payment.failed', data: payload };
      }
      case 'payfast': {
        return { id: payload.m_payment_id, type: payload.payment_status === 'COMPLETE' ? 'payment.completed' : 'payment.failed', data: payload };
      }
      case 'paynow': {
        return { id: payload.reference, type: payload.status === 'Paid' ? 'payment.completed' : 'payment.failed', data: payload };
      }
      default:
        return null;
    }
  }

  private async handlePaymentCompleted(event: { data: any }): Promise<void> {
    const data = event.data;
    const subscriptionId = data.metadata?.reference || data.m_payment_id || data.id;

    const subRef = adminDb.doc(`subscriptions/${subscriptionId}`);
    const sub = await subRef.get();
    if (!sub.exists) return;

    await subRef.update({
      status: 'active',
      currentPeriodEnd: this.calculateNewPeriodEnd(sub.data()!.currentPeriodEnd?.toDate() || new Date(), sub.data()!.billingPeriod || 'monthly'),
      updated: new Date(),
    });

    const subData = sub.data()!;
    if (subData.userId) {
      const userDoc = await adminDb.collection('users').doc(subData.userId).get();
      const userData = userDoc.data();
      if (userData?.email) {
        const name = (userData.displayName || userData.email.split('@')[0] || 'there') as string;
        const planName = (subData.plan || 'Growth') as string;
        const price = subData.price || 5;
        const { subject, html } = paymentConfirmationEmail(name, planName, price);
        sendEmail(userData.email as string, subject, html).catch(() => {});
      }
    }
  }

  private async handlePaymentFailed(event: { data: any }): Promise<void> {
    const subscriptionId = event.data.metadata?.reference || event.data.m_payment_id;
    if (!subscriptionId) return;

    const subRef = adminDb.doc(`subscriptions/${subscriptionId}`);
    await subRef.update({ status: 'past_due', updated: new Date() });
  }

  private async handleSubscriptionRenewed(event: { data: { id: string } }): Promise<void> {
    const subscriptionId = event.data.id;
    const subRef = adminDb.doc(`subscriptions/${subscriptionId}`);
    const sub = await subRef.get();
    if (!sub.exists) return;

    await subRef.update({
      currentPeriodEnd: this.calculateNewPeriodEnd(new Date(), sub.data()!.billingPeriod || 'monthly'),
      updated: new Date(),
    });
  }

  private calculateNewPeriodEnd(from: Date, period: string): Date {
    const end = new Date(from);
    switch (period) {
      case 'monthly': end.setMonth(end.getMonth() + 1); break;
      case 'quarterly': end.setMonth(end.getMonth() + 3); break;
      case 'annual': end.setFullYear(end.getFullYear() + 1); break;
    }
    return end;
  }

  private verifySignature(provider: string, payload: any): boolean {
    switch (provider) {
      case 'stripe':
        return this.verifyStripeSignature(payload);
      case 'ecocash':
        return this.verifyEcoCashSignature(payload);
      case 'payfast':
        return this.verifyPayFastSignature(payload);
      case 'paynow':
        return new PayNowProvider().verifyITNHash(payload);
      default:
        console.error(`[WebhookHandler] Unknown provider: ${provider}`);
        return false;
    }
  }

  /**
   * Stripe: Verify HMAC-SHA256 signature using webhook secret.
   * Stripe sends signature in `stripe-signature` header as:
   * t=<timestamp>,v1=<signature>
   * We compute HMAC over `${timestamp}.${body}` and compare.
   */
  private verifyStripeSignature(payload: any): boolean {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[WebhookHandler] STRIPE_WEBHOOK_SECRET not configured');
      return false;
    }

    const sigHeader = payload.headers?.['stripe-signature'] || payload.stripeSignature;
    if (!sigHeader) {
      console.error('[WebhookHandler] Missing stripe-signature header');
      return false;
    }

    try {
      const elements = sigHeader.split(',').reduce((acc: Record<string, string>, part: string) => {
        const [key, value] = part.split('=');
        acc[key.trim()] = value?.trim() || '';
        return acc;
      }, {});

      const timestamp = elements['t'];
      const signature = elements['v1'];
      if (!timestamp || !signature) return false;

      // Reject if timestamp is older than 5 minutes (replay protection)
      const timestampSeconds = parseInt(timestamp, 10);
      if (Math.abs(Date.now() / 1000 - timestampSeconds) > 300) {
        console.error('[WebhookHandler] Stripe webhook timestamp too old');
        return false;
      }

      const body = typeof payload.body === 'string' ? payload.body : JSON.stringify(payload.body || payload);
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${body}`)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSig, 'hex')
      );
    } catch (e) {
      console.error('[WebhookHandler] Stripe signature verification failed:', e);
      return false;
    }
  }

  /**
   * EcoCash: Verify using the API key in the Authorization header.
   * EcoCash webhooks send Bearer token that should match our ECOCASH_API_KEY.
   * In production, this should also check IP whitelist.
   */
  private verifyEcoCashSignature(payload: any): boolean {
    const apiKey = process.env.ECOCASH_API_KEY;
    if (!apiKey) {
      console.error('[WebhookHandler] ECOCASH_API_KEY not configured');
      return false;
    }

    const authHeader = payload.headers?.['authorization'] || payload.authorization;
    if (!authHeader) {
      console.error('[WebhookHandler] Missing Authorization header from EcoCash');
      return false;
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(apiKey)
    );
  }

  /**
   * PayFast: Verify MD5 signature.
   * PayFast sends a `signature` field computed as:
   * MD5(sorted query string fields + passphrase)
   * We recompute and compare.
   */
  private verifyPayFastSignature(payload: any): boolean {
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    const data = payload.body || payload;

    if (!data.signature) {
      console.error('[WebhookHandler] Missing PayFast signature');
      return false;
    }

    try {
      // Build the data string from all fields except 'signature'
      const fields: Record<string, string> = {};
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'signature' && value !== '' && value !== undefined && value !== null) {
          fields[key] = String(value);
        }
      }

      // Sort fields alphabetically and build query string
      const sortedKeys = Object.keys(fields).sort();
      let dataString = sortedKeys.map(key => `${key}=${encodeURIComponent(fields[key])}`).join('&');

      // Append passphrase if provided
      if (passphrase) {
        dataString += `&passphrase=${encodeURIComponent(passphrase)}`;
      }

      const expectedSignature = crypto.createHash('md5').update(dataString).digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(data.signature),
        Buffer.from(expectedSignature)
      );
    } catch (e) {
      console.error('[WebhookHandler] PayFast signature verification failed:', e);
      return false;
    }
  }
}
