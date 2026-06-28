import type { PayoutProvider, PayoutRequest, PayoutResponse } from './payout-provider.interface';

/**
 * InnBucks payout provider.
 *
 * InnBucks is a Zimbabwean fintech that provides payment infrastructure
 * for disbursements to mobile money wallets, bank accounts, and cash pickups.
 *
 * Environment variables required:
 * - INNBUCKS_API_KEY: API key for authentication
 * - INNBUCKS_API_SECRET: API secret for request signing
 * - INNBUCKS_API_URL: Base URL (defaults to production)
 */
export class InnBucksPayoutProvider implements PayoutProvider {
  readonly name = 'innbucks' as const;
  readonly supportedCurrencies = ['USD', 'ZIG', 'ZWL'];

  private get baseUrl(): string {
    return process.env.INNBUCKS_API_URL || 'https://api.innbucks.com/v1';
  }

  private get apiKey(): string {
    return process.env.INNBUCKS_API_KEY || '';
  }

  private get apiSecret(): string {
    return process.env.INNBUCKS_API_SECRET || '';
  }

  async sendPayout(request: PayoutRequest): Promise<PayoutResponse> {
    if (!this.apiKey) {
      return { success: false, providerRef: '', status: 'failed', errorMessage: 'INNBUCKS_API_KEY not configured' };
    }

    try {
      const payload = {
        amount: request.amount,
        currency: request.currency || 'USD',
        recipient: request.recipient,
        reference: request.reference,
        description: request.description || 'Partner commission payout',
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://radbitstudios.co.zw'}/api/webhooks/innbucks`,
      };

      const signature = await this.signPayload(payload);

      const response = await fetch(`${this.baseUrl}/disbursements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Signature': signature,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          providerRef: '',
          status: 'failed',
          errorMessage: data.message || data.error || 'InnBucks payout failed',
        };
      }

      return {
        success: true,
        providerRef: data.disbursementId || data.reference || request.reference,
        status: 'sent',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, providerRef: '', status: 'failed', errorMessage: message };
    }
  }

  async checkStatus(providerRef: string): Promise<PayoutResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/disbursements/${providerRef}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      const data = await response.json();
      return {
        success: data.status === 'completed' || data.status === 'sent',
        providerRef,
        status: data.status === 'completed' || data.status === 'sent' ? 'sent' : 'failed',
        errorMessage: data.error,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, providerRef, status: 'failed', errorMessage: message };
    }
  }

  private async signPayload(payload: Record<string, unknown>): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoded = new TextEncoder().encode(JSON.stringify(payload) + this.apiSecret);
      const hash = await crypto.subtle.digest('SHA-256', encoded);
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
    // Fallback for environments without Web Crypto
    const { createHash } = await import('crypto');
    return createHash('sha256').update(JSON.stringify(payload) + this.apiSecret).digest('hex');
  }
}
