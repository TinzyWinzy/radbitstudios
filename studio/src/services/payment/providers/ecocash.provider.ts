import type { PaymentProvider, PaymentRequest, PaymentResponse } from './provider.interface';

export class EcoCashProvider implements PaymentProvider {
  readonly name = 'ecocash' as const;
  readonly supportedCurrencies = ['USD', 'ZIG'];
  readonly supportedCountries = ['ZW'];

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const { amount, currency, description, reference, notifyUrl } = request;

    try {
      const response = await fetch('https://api.econet.co.zw/ecocash/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ECOCASH_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          merchantReference: reference,
          returnUrl: request.returnUrl,
          notifyUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, transactionId: '', providerRef: '', status: 'failed', errorMessage: data.message || 'EcoCash payment failed' };
      }

      return {
        success: true,
        transactionId: data.transactionId || reference,
        providerRef: data.providerRef || '',
        status: 'pending',
        redirectUrl: data.redirectUrl,
      };
    } catch (error: any) {
      return { success: false, transactionId: '', providerRef: '', status: 'failed', errorMessage: error.message };
    }
  }

  async verifyPayment(providerRef: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`https://api.econet.co.zw/ecocash/v1/payments/${providerRef}`, {
        headers: { 'Authorization': `Bearer ${process.env.ECOCASH_API_KEY}` },
      });
      const data = await response.json();
      return {
        success: data.status === 'completed',
        transactionId: data.transactionId || '',
        providerRef,
        status: data.status || 'failed',
      };
    } catch (error: any) {
      return { success: false, transactionId: '', providerRef, status: 'failed', errorMessage: error.message };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const response = await fetch('https://api.econet.co.zw/ecocash/v1/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ECOCASH_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId, amount }),
      });
      const data = await response.json();
      return {
        success: response.ok,
        transactionId,
        providerRef: data.providerRef || '',
        status: data.status || 'failed',
      };
    } catch (error: any) {
      return { success: false, transactionId, providerRef: '', status: 'failed', errorMessage: error.message };
    }
  }
}
