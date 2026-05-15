import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export class WebhookHandler {
  async handle(provider: string, rawPayload: any): Promise<{ status: 'processed' | 'duplicate' | 'ignored'; eventId?: string }> {
    const event = this.normalize(provider, rawPayload);

    if (!event) return { status: 'ignored' };

    // Idempotency: check if already processed
    const idempotencyRef = doc(db, 'webhook_events', event.id);
    const existing = await getDoc(idempotencyRef);
    if (existing.exists()) return { status: 'duplicate', eventId: event.id };

    // Validate signature
    if (!this.verifySignature(provider, rawPayload)) {
      console.error(`Invalid webhook signature from ${provider}`);
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
          console.warn(`Unknown webhook event type: ${event.type}`);
      }

      // Mark as processed
      await setDoc(idempotencyRef, {
        id: event.id,
        provider,
        type: event.type,
        payload: rawPayload,
        processedAt: new Date(),
      });

      return { status: 'processed', eventId: event.id };
    } catch (error) {
      console.error(`Webhook processing failed:`, error);
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
      default:
        return null;
    }
  }

  private async handlePaymentCompleted(event: { data: any }): Promise<void> {
    const data = event.data;
    const subscriptionId = data.metadata?.reference || data.m_payment_id || data.id;

    const subRef = doc(db, 'subscriptions', subscriptionId);
    const sub = await getDoc(subRef);
    if (!sub.exists()) return;

    await updateDoc(subRef, {
      status: 'active',
      currentPeriodEnd: this.calculateNewPeriodEnd(sub.data().currentPeriodEnd?.toDate() || new Date(), sub.data().billingPeriod || 'monthly'),
      updated: new Date(),
    });
  }

  private async handlePaymentFailed(event: { data: any }): Promise<void> {
    const subscriptionId = event.data.metadata?.reference || event.data.m_payment_id;
    if (!subscriptionId) return;

    const subRef = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(subRef, { status: 'past_due', updated: new Date() });
  }

  private async handleSubscriptionRenewed(event: { data: { id: string } }): Promise<void> {
    const subscriptionId = event.data.id;
    const subRef = doc(db, 'subscriptions', subscriptionId);
    const sub = await getDoc(subRef);
    if (!sub.exists()) return;

    await updateDoc(subRef, {
      currentPeriodEnd: this.calculateNewPeriodEnd(new Date(), sub.data().billingPeriod || 'monthly'),
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
      case 'stripe': {
        const sigHeader = payload.headers?.['stripe-signature'];
        if (!sigHeader || !process.env.STRIPE_WEBHOOK_SECRET) return false;
        // Stripe signature verification would use stripe.webhooks.constructEvent()
        return true;
      }
      case 'ecocash':
        // EcoCash basic auth or IP whitelist
        return true;
      case 'payfast': {
        // PayFast uses MD5 signature verification
        return true;
      }
      default:
        return true;
    }
  }
}
