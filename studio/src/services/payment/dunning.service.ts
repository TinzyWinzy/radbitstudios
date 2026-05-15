// Dunning management — retry failed payments
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
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
    const subRef = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(subRef, { status: 'past_due', updated: new Date() });

    await this.scheduleRetry(userId, subscriptionId, step.delayHours);
  }

  async processScheduledRetries(): Promise<void> {
    const now = new Date();
    const retriesRef = collection(db, 'payment_retries');
    const q = query(retriesRef, where('scheduledAt', '<=', Timestamp.fromDate(now)));

    const snapshot = await getDocs(q);
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
        const subRef = doc(db, 'subscriptions', data.subscriptionId);
        await updateDoc(subRef, { status: 'active', updated: new Date() });
        await this.deleteRetry(snapDoc.id);
      }
    }
  }

  private async getAttemptCount(_userId: string, subscriptionId: string): Promise<number> {
    const retriesRef = collection(db, 'payment_retries');
    const q = query(retriesRef, where('subscriptionId', '==', subscriptionId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  private async scheduleRetry(_userId: string, subscriptionId: string, delayHours: number): Promise<void> {
    const scheduledAt = new Date(Date.now() + delayHours * 3600000);
    const retryRef = doc(collection(db, 'payment_retries'));
    await setDoc(retryRef, { userId: _userId, subscriptionId, scheduledAt, createdAt: new Date() });
  }

  private async expireSubscription(subscriptionId: string): Promise<void> {
    const subRef = doc(db, 'subscriptions', subscriptionId);
    const sub = await getDoc(subRef);
    if (!sub.exists()) return;

    await updateDoc(subRef, { status: 'expired', updated: new Date() });
    await updateDoc(doc(db, 'users', sub.data().userId), { plan: 'free' });
  }

  private async deleteRetry(retryId: string): Promise<void> {
    await updateDoc(doc(db, 'payment_retries', retryId), { processedAt: new Date() });
  }
}
