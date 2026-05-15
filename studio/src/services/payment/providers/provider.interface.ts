export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentProviderName = 'ecocash' | 'onemoney' | 'stripe' | 'payfast' | 'ozow';

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  userId: string;
  metadata?: Record<string, unknown>;
  returnUrl?: string;
  notifyUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  providerRef: string;
  status: PaymentStatus;
  redirectUrl?: string;
  errorMessage?: string;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  readonly supportedCurrencies: string[];
  readonly supportedCountries: string[];

  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(providerRef: string): Promise<PaymentResponse>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse>;
}
