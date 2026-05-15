import type { PaymentProvider, PaymentRequest, PaymentResponse } from './provider.interface';

export class PayFastProvider implements PaymentProvider {
  readonly name = 'payfast' as const;
  readonly supportedCurrencies = ['ZAR'];
  readonly supportedCountries = ['ZA'];

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const { amount, description, reference, returnUrl, notifyUrl } = request;

    const payload: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || '',
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || '',
      return_url: returnUrl || `${process.env.FRONTEND_URL}/settings`,
      cancel_url: returnUrl ? `${returnUrl}?cancelled=true` : `${process.env.FRONTEND_URL}/settings`,
      notify_url: notifyUrl || `${process.env.API_URL}/api/webhooks/payfast`,
      m_payment_id: reference,
      amount: amount.toString(),
      item_name: description,
      signature: this.generateSignature({ amount, reference }),
    };

    const params = new URLSearchParams(payload);
    return {
      success: true,
      transactionId: reference,
      providerRef: reference,
      status: 'pending',
      redirectUrl: `https://www.payfast.co.za/eng/process?${params.toString()}`,
    };
  }

  async verifyPayment(providerRef: string): Promise<PaymentResponse> {
    return { success: true, transactionId: providerRef, providerRef, status: 'completed' };
  }

  async refundPayment(_transactionId: string, _amount?: number): Promise<PaymentResponse> {
    return { success: false, transactionId: _transactionId, providerRef: '', status: 'failed', errorMessage: 'PayFast refunds not implemented' };
  }

  private generateSignature(data: { amount: number; reference: string }): string {
    const pfData = `merchant_id=${process.env.PAYFAST_MERCHANT_ID}&merchant_key=${process.env.PAYFAST_MERCHANT_KEY}&m_payment_id=${data.reference}&amount=${data.amount}`;
    const crypto = require('crypto');
    return crypto.createHash('md5').update(pfData).digest('hex');
  }
}
