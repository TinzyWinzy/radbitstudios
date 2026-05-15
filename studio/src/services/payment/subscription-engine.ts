import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { PaymentOrchestrator } from './payment-orchestrator';
import { InvoiceService } from './invoice.service';

export type SubscriptionPlanId = 'free' | 'growth' | 'pro' | 'enterprise';
export type BillingPeriod = 'monthly' | 'quarterly' | 'annual';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';

export interface ActiveSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlanId;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  created: Date;
  updated: Date;
}

export const SUBSCRIPTION_PRICES: Record<SubscriptionPlanId, Record<BillingPeriod, number>> = {
  free:       { monthly: 0, quarterly: 0, annual: 0 },
  growth:    { monthly: 5, quarterly: 13.50, annual: 45 },
  pro:       { monthly: 15, quarterly: 40.50, annual: 135 },
  enterprise: { monthly: 0, quarterly: 0, annual: 0 },
};

const SUBSCRIPTION_DISCOUNTS: Partial<Record<BillingPeriod, number>> = { quarterly: 0.10, annual: 0.25 };

export class SubscriptionEngine {
  private payments: PaymentOrchestrator;
  private invoices: InvoiceService;

  constructor() {
    this.payments = new PaymentOrchestrator();
    this.invoices = new InvoiceService();
  }

  async createSubscription(userId: string, plan: SubscriptionPlanId, billingPeriod: BillingPeriod, country: string, currency: string): Promise<{ subscription: ActiveSubscription; redirectUrl?: string }> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error('User not found');

    const price = SUBSCRIPTION_PRICES[plan][billingPeriod];
    const discount = SUBSCRIPTION_DISCOUNTS[billingPeriod] || 0;
    const finalPrice = price * (1 - discount);

    // Charge via payment provider
    const payment = await this.payments.initiatePayment({
      amount: finalPrice,
      currency,
      description: `Radbit ${plan} plan - ${billingPeriod}`,
      reference: `sub-${userId}-${Date.now()}`,
      userId,
      metadata: { country, plan, billingPeriod },
      returnUrl: `${process.env.FRONTEND_URL}/settings?payment=success`,
      notifyUrl: `${process.env.API_URL}/api/webhooks/payment`,
    });

    if (!payment.success) throw new Error(payment.errorMessage || 'Payment initiation failed');

    // Create subscription document in Firestore
    const now = new Date();
    const periodEnd = this.calculatePeriodEnd(now, billingPeriod);

    const subscriptionRef = doc(db, 'subscriptions', payment.transactionId);
    const subscription: ActiveSubscription = {
      id: payment.transactionId,
      userId,
      plan,
      status: 'active',
      billingPeriod,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      created: now,
      updated: now,
    };

    await setDoc(subscriptionRef, subscription);

    // Generate invoice
    await this.invoices.generateInvoice({
      userId,
      subscriptionId: payment.transactionId,
      amount: finalPrice,
      currency,
      description: `Radbit ${plan} plan - ${billingPeriod}`,
      country,
      paymentProviderRef: payment.providerRef,
      paidAt: now,
    });

    // Update user's subscription plan in their profile
    await updateDoc(doc(db, 'users', userId), {
      plan,
      subscriptionId: payment.transactionId,
      [`usage.assessmentSummary.total`]: plan === 'free' ? 1 : 999,
      [`usage.assessmentSummary.remaining`]: plan === 'free' ? 1 : 999,
      [`usage.templateGeneration.total`]: plan === 'free' ? 5 : 999,
      [`usage.templateGeneration.remaining`]: plan === 'free' ? 5 : 999,
      [`usage.mentorChat.total`]: plan === 'free' ? 10 : 999,
      [`usage.mentorChat.remaining`]: plan === 'free' ? 10 : 999,
      [`usage.dashboardInsights.total`]: 999,
      [`usage.dashboardInsights.remaining`]: 999,
      [`usage.tendersCuration.total`]: 999,
      [`usage.tendersCuration.remaining`]: 999,
    });

    return { subscription, redirectUrl: payment.redirectUrl };
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<void> {
    const subRef = doc(db, 'subscriptions', subscriptionId);
    const sub = await getDoc(subRef);
    if (!sub.exists()) throw new Error('Subscription not found');

    if (immediately) {
      await updateDoc(subRef, { status: 'canceled', updated: new Date() });
      await updateDoc(doc(db, 'users', sub.data().userId), { plan: 'free' });
    } else {
      await updateDoc(subRef, { cancelAtPeriodEnd: true, updated: new Date() });
    }
  }

  async retryPayment(subscriptionId: string): Promise<{ success: boolean; redirectUrl?: string }> {
    const subRef = doc(db, 'subscriptions', subscriptionId);
    const sub = await getDoc(subRef);
    if (!sub.exists()) return { success: false };

    const data = sub.data() as ActiveSubscription;
    const price = SUBSCRIPTION_PRICES[data.plan][data.billingPeriod];
    const discount = SUBSCRIPTION_DISCOUNTS[data.billingPeriod] || 0;
    const finalPrice = price * (1 - discount);

    const payment = await this.payments.initiatePayment({
      amount: finalPrice,
      currency: 'USD',
      description: `Radbit ${data.plan} renewal`,
      reference: `retry-${subscriptionId}-${Date.now()}`,
      userId: data.userId,
      metadata: { country: 'ZW', plan: data.plan, billingPeriod: data.billingPeriod },
      returnUrl: `${process.env.FRONTEND_URL}/settings?payment=success`,
    });

    if (payment.success) {
      await updateDoc(subRef, { status: 'active', currentPeriodEnd: this.calculatePeriodEnd(new Date(), data.billingPeriod), updated: new Date() });
    }

    return { success: payment.success, redirectUrl: payment.redirectUrl };
  }

  private calculatePeriodEnd(from: Date, period: BillingPeriod): Date {
    const end = new Date(from);
    switch (period) {
      case 'monthly':   end.setMonth(end.getMonth() + 1); break;
      case 'quarterly': end.setMonth(end.getMonth() + 3); break;
      case 'annual':    end.setFullYear(end.getFullYear() + 1); break;
    }
    return end;
  }
}
