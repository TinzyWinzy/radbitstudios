import type { PaymentProvider, PaymentRequest, PaymentResponse } from './providers/provider.interface';
import { EcoCashProvider } from './providers/ecocash.provider';
import { StripeProvider } from './providers/stripe.provider';
import { PayFastProvider } from './providers/payfast.provider';

export class PaymentOrchestrator {
  private providers = new Map<string, PaymentProvider>();

  constructor() {
    this.registerProvider('ecocash', new EcoCashProvider());
    this.registerProvider('stripe', new StripeProvider());
    this.registerProvider('payfast', new PayFastProvider());
  }

  registerProvider(name: string, provider: PaymentProvider): void {
    this.providers.set(name, provider);
  }

  getProvider(country: string, currency: string): PaymentProvider {
    const priority: Record<string, string[]> = {
      ZW: ['ecocash', 'onemoney', 'stripe'],
      ZA: ['payfast', 'stripe'],
      ZM: ['stripe'],
      BW: ['stripe'],
      MZ: ['stripe'],
      NA: ['stripe'],
    };

    const list = priority[country] || ['stripe'];
    for (const name of list) {
      const provider = this.providers.get(name);
      if (provider?.supportedCurrencies.includes(currency)) return provider;
    }
    throw new Error(`No payment provider available for ${country}/${currency}`);
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const country = (request.metadata?.country as string) || 'ZW';
    const provider = this.getProvider(country, request.currency);
    return provider.initiatePayment(request);
  }

  async verifyPayment(providerName: string, providerRef: string): Promise<PaymentResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Unknown provider: ${providerName}`);
    return provider.verifyPayment(providerRef);
  }
}
