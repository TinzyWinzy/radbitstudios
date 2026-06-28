import type { PayoutProvider, PayoutRequest, PayoutResponse } from './payout-provider.interface';

export class EcoCashPayoutProvider implements PayoutProvider {
  readonly name = 'ecocash' as const;
  readonly supportedCurrencies = ['USD', 'ZIG'];

  private get baseUrl(): string {
    return process.env.ECOCASH_API_URL || 'https://api.econet.co.zw/ecocash/v1';
  }

  private get apiKey(): string {
    return process.env.ECOCASH_API_KEY || '';
  }

  async sendPayout(request: PayoutRequest): Promise<PayoutResponse> {
    if (!this.apiKey) {
      return { success: false, providerRef: '', status: 'failed', errorMessage: 'ECOCASH_API_KEY not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/payouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency || 'USD',
          recipient: request.recipient,
          reference: request.reference,
          description: request.description || 'Partner commission payout',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          providerRef: '',
          status: 'failed',
          errorMessage: data.message || data.error || 'EcoCash payout failed',
        };
      }

      return {
        success: true,
        providerRef: data.transactionId || data.reference || request.reference,
        status: 'sent',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, providerRef: '', status: 'failed', errorMessage: message };
    }
  }

  async checkStatus(providerRef: string): Promise<PayoutResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payouts/${providerRef}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      const data = await response.json();
      return {
        success: data.status === 'completed',
        providerRef,
        status: data.status === 'completed' ? 'sent' : 'failed',
        errorMessage: data.error,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, providerRef, status: 'failed', errorMessage: message };
    }
  }
}
