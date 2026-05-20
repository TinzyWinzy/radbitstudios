// Dunning management — retry failed payments
import { adminDb } from '@/lib/firebase/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { PaymentOrchestrator } from './payment-orchestrator';

interface DunningStep {
  delayHours: number;
  channel: 'whatsapp' | 'email' | 'sms';
  template: string;
}

const DUNNING_FLOW: DunningStep[] = [
  { delayHours: 24, channel: 'whatsapp', template: 'payment_failed_24h' },
  { delayHours: 48, channel: 'whatsapp', template: 'payment_failed_48h' },
  { delayHours: 72, channel: 'sms', template: 'payment_failed_72h' },
];

export class DunningService {
  private payments: PaymentOrchestrator;

  constructor() {
    this.payments = new PaymentOrchestrator();
  }

  async processFailedPayment(userId: string, subscriptionId: string): Promise<void> {
    const attempts = await this.getAttemptCount(userId, subscriptionId);

    if (attempts >= DUNNING_FLOW.length) {
      await this.expireSubscription(subscriptionId);
      return;
    }

    const step = DUNNING_FLOW[attempts];
    const subRef = adminDb.doc(`subscriptions/${subscriptionId}`);
    await subRef.update({ status: 'past_due', updated: new Date() });

    await this.scheduleRetry(userId, subscriptionId, step.delayHours);
  }

  async processScheduledRetries(): Promise<void> {
    const now = new Date();
    const snapshot = await adminDb
      .collection('payment_retries')
      .where('scheduledAt', '<=', Timestamp.fromDate(now))
      .get();
    for (const snapDoc of snapshot.docs) {
      const data = snapDoc.data() as { amount: number; currency: string; description: string; subscriptionId: string; userId: string; plan: string };
      const result = await this.payments.initiatePayment({
        amount: data.amount,
        currency: data.currency || 'USD',
        description: data.description,
        reference: `retry-${data.subscriptionId}-${Date.now()}`,
        userId: data.userId,
        metadata: { country: 'ZW', plan: data.plan },
      });

      if (result.success) {
        const subRef = adminDb.doc(`subscriptions/${data.subscriptionId}`);
        await subRef.update({ status: 'active', updated: new Date() });
        await this.deleteRetry(snapDoc.id);
      }
    }
  }

  private async getAttemptCount(_userId: string, subscriptionId: string): Promise<number> {
    const snapshot = await adminDb
      .collection('payment_retries')
      .where('subscriptionId', '==', subscriptionId)
      .get();
    return snapshot.size;
  }

  private async scheduleRetry(_userId: string, subscriptionId: string, delayHours: number): Promise<void> {
    const scheduledAt = new Date(Date.now() + delayHours * 3600000);
    const retryRef = adminDb.collection('payment_retries').doc();
    await retryRef.set({ userId: _userId, subscriptionId, scheduledAt, createdAt: new Date() });
  }

  private async expireSubscription(subscriptionId: string): Promise<void> {
    const subRef = adminDb.doc(`subscriptions/${subscriptionId}`);
    const sub = await subRef.get();
    if (!sub.exists) return;

    await subRef.update({ status: 'expired', updated: new Date() });
    await adminDb.doc(`users/${sub.data()!.userId}`).update({ plan: 'free' });
  }

  private async deleteRetry(retryId: string): Promise<void> {
    await adminDb.doc(`payment_retries/${retryId}`).update({ processedAt: new Date() });
  }
}
