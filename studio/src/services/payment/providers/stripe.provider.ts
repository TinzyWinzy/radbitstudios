import type { PaymentProvider, PaymentRequest, PaymentResponse } from './provider.interface';

export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe' as const;
  readonly supportedCurrencies = ['USD', 'ZAR', 'EUR', 'GBP'];
  readonly supportedCountries = ['ZW', 'ZA', 'ZM', 'BW', 'MZ', 'NA'];
  private _client: any = null;

  private get client(): any {
    if (!this._client) {
      const StripeLib = require('stripe');
      this._client = new StripeLib(process.env.STRIPE_SECRET_KEY || '');
    }
    return this._client;
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const session = await this.client.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: request.currency.toLowerCase(),
            product_data: { name: request.description },
            unit_amount: Math.round(request.amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: request.returnUrl || `${process.env.FRONTEND_URL}/settings?payment=success`,
        cancel_url: request.returnUrl ? `${request.returnUrl}?cancelled=true` : `${process.env.FRONTEND_URL}/settings`,
        metadata: {
          userId: request.userId,
          reference: request.reference,
        },
      });

      return {
        success: true,
        transactionId: session.id,
        providerRef: session.id,
        status: 'pending',
        redirectUrl: session.url || undefined,
      };
    } catch (error: any) {
      return { success: false, transactionId: '', providerRef: '', status: 'failed', errorMessage: error.message };
    }
  }

  async verifyPayment(providerRef: string): Promise<PaymentResponse> {
    try {
      const session = await this.client.checkout.sessions.retrieve(providerRef);
      return {
        success: session.payment_status === 'paid',
        transactionId: session.id,
        providerRef,
        status: session.payment_status === 'paid' ? 'completed' : 'pending',
      };
    } catch (error: any) {
      return { success: false, transactionId: '', providerRef, status: 'failed', errorMessage: error.message };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const refund = await this.client.refunds.create({
        payment_intent: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return {
        success: refund.status === 'succeeded',
        transactionId,
        providerRef: refund.id,
        status: refund.status === 'succeeded' ? 'refunded' : 'pending',
      };
    } catch (error: any) {
      return { success: false, transactionId, providerRef: '', status: 'failed', errorMessage: error.message };
    }
  }
}
