import type { PaymentProvider, PaymentRequest, PaymentResponse } from './provider.interface';

export class PayNowProvider implements PaymentProvider {
  readonly name = 'paynow' as const;
  readonly supportedCurrencies = ['USD', 'ZIG'];
  readonly supportedCountries = ['ZW'];

  private get integrationId(): string {
    return process.env.PAYNOW_INTEGRATION_ID || '';
  }

  private get integrationKey(): string {
    return process.env.PAYNOW_INTEGRATION_KEY || '';
  }

  private get authEmail(): string {
    return process.env.PAYNOW_AUTH_EMAIL || '';
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const { amount, description, reference, returnUrl, notifyUrl } = request;

    const payload = new URLSearchParams({
      id: this.integrationId,
      reference,
      amount: amount.toFixed(2),
      additionalinfo: description,
      returnurl: returnUrl || `${process.env.FRONTEND_URL}/settings`,
      resulturl: notifyUrl || `${process.env.FRONTEND_URL}/api/webhooks/paynow`,
      ...(this.authEmail ? { authemail: this.authEmail } : {}),
    });

    try {
      const response = await fetch('https://www.paynow.co.zw/interface/initiatetransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      });

      const text = await response.text();
      const parsed = Object.fromEntries(new URLSearchParams(text));

      if (parsed.status !== 'Ok') {
        return {
          success: false,
          transactionId: reference,
          providerRef: '',
          status: 'failed',
          errorMessage: parsed.error || 'PayNow initiation failed',
        };
      }

      return {
        success: true,
        transactionId: reference,
        providerRef: parsed.pollurl || '',
        status: 'pending',
        redirectUrl: parsed.browserurl,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, transactionId: reference, providerRef: '', status: 'failed', errorMessage: message };
    }
  }

  async verifyPayment(providerRef: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(providerRef);
      const text = await response.text();
      const parsed = Object.fromEntries(new URLSearchParams(text));

      return {
        success: parsed.status === 'Paid',
        transactionId: parsed.reference || '',
        providerRef,
        status: parsed.status === 'Paid' ? 'completed' : 'pending',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, transactionId: '', providerRef, status: 'failed', errorMessage: message };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const payload = new URLSearchParams({
        id: this.integrationId,
        reference: transactionId,
        ...(amount ? { amount: amount.toFixed(2) } : {}),
      });

      const response = await fetch('https://www.paynow.co.zw/interface/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      });

      const text = await response.text();
      const parsed = Object.fromEntries(new URLSearchParams(text));

      return {
        success: parsed.status === 'Ok',
        transactionId,
        providerRef: parsed.pollurl || '',
        status: parsed.status === 'Ok' ? 'refunded' : 'failed',
        errorMessage: parsed.error,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, transactionId, providerRef: '', status: 'failed', errorMessage: message };
    }
  }

  verifyITNHash(payload: Record<string, string>): boolean {
    const fields = ['reference', 'paynowreference', 'amount', 'status', 'pollurl', 'additionalinfo', 'authemail'];
    const values = fields.map(f => payload[f] || '').join('');
    const crypto = require('crypto');
    const computed = crypto.createHash('md5').update(values + this.integrationKey).digest('hex').toUpperCase();
    return computed === (payload.hash || '').toUpperCase();
  }
}
