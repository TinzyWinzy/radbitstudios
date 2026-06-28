export type PayoutProviderName = 'ecocash' | 'innbucks';

export interface PayoutRequest {
  amount: number;
  currency: string;
  recipient: string;
  reference: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PayoutResponse {
  success: boolean;
  providerRef: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}

export interface PayoutProvider {
  readonly name: PayoutProviderName;
  readonly supportedCurrencies: string[];
  sendPayout(request: PayoutRequest): Promise<PayoutResponse>;
  checkStatus(providerRef: string): Promise<PayoutResponse>;
}
