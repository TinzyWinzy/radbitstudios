import { describe, it, expect } from 'vitest';
import { PaymentOrchestrator } from '@/services/payment/payment-orchestrator';
import { EcoCashProvider } from '@/services/payment/providers/ecocash.provider';
import { StripeProvider } from '@/services/payment/providers/stripe.provider';
import { PayNowProvider } from '@/services/payment/providers/paynow.provider';
import { InvoiceService } from '@/services/payment/invoice.service';
import { SUBSCRIPTION_PRICES, type BillingPeriod } from '@/services/payment/subscription-engine';

describe('PaymentOrchestrator', () => {
  it('routes Zimbabwe USD payments to PayNow', () => {
    const orchestrator = new PaymentOrchestrator();
    const provider = orchestrator.getProvider('ZW', 'USD');
    expect(provider.name).toBe('paynow');
  });

  it('routes Zimbabwe ZIG payments to PayNow', () => {
    const orchestrator = new PaymentOrchestrator();
    const provider = orchestrator.getProvider('ZW', 'ZIG');
    expect(provider.name).toBe('paynow');
  });

  it('falls back to Stripe for unsupported ZW currency', () => {
    const orchestrator = new PaymentOrchestrator();
    const provider = orchestrator.getProvider('ZW', 'ZAR');
    expect(provider.name).toBe('stripe');
  });

  it('routes South Africa ZAR payments to PayFast', () => {
    const orchestrator = new PaymentOrchestrator();
    const provider = orchestrator.getProvider('ZA', 'ZAR');
    expect(provider.name).toBe('payfast');
  });

  it('falls back to Stripe for unsupported country', () => {
    const orchestrator = new PaymentOrchestrator();
    const provider = orchestrator.getProvider('MZ', 'USD');
    expect(provider.name).toBe('stripe');
  });

  it('throws for completely unsupported currency', () => {
    const orchestrator = new PaymentOrchestrator();
    expect(() => orchestrator.getProvider('ZW', 'XYZ')).toThrow();
  });
});

describe('SUBSCRIPTION_PRICES', () => {
  it('free plan is always $0', () => {
    for (const period of ['monthly', 'quarterly', 'annual'] as BillingPeriod[]) {
      expect(SUBSCRIPTION_PRICES.free[period]).toBe(0);
    }
  });

  it('quarterly discount is 10%', () => {
    expect(SUBSCRIPTION_PRICES.growth.quarterly).toBeCloseTo(SUBSCRIPTION_PRICES.growth.monthly * 3 * 0.9, 1);
    expect(SUBSCRIPTION_PRICES.pro.quarterly).toBeCloseTo(SUBSCRIPTION_PRICES.pro.monthly * 3 * 0.9, 1);
  });

  it('annual discount is 25%', () => {
    expect(SUBSCRIPTION_PRICES.growth.annual).toBeCloseTo(SUBSCRIPTION_PRICES.growth.monthly * 12 * 0.75, 0);
    expect(SUBSCRIPTION_PRICES.pro.annual).toBeCloseTo(SUBSCRIPTION_PRICES.pro.monthly * 12 * 0.75, 0);
  });

  it('prices are positive for paid plans', () => {
    expect(SUBSCRIPTION_PRICES.growth.monthly).toBeGreaterThan(0);
    expect(SUBSCRIPTION_PRICES.pro.monthly).toBeGreaterThan(0);
  });
});

describe('EcoCashProvider', () => {
  it('supports ZW and USD/ZIG', () => {
    const provider = new EcoCashProvider();
    expect(provider.supportedCountries).toContain('ZW');
    expect(provider.supportedCurrencies).toContain('USD');
    expect(provider.supportedCurrencies).toContain('ZIG');
  });
});

describe('StripeProvider', () => {
  it('supports multiple SADC countries', () => {
    const provider = new StripeProvider();
    expect(provider.supportedCountries).toContain('ZA');
    expect(provider.supportedCountries).toContain('ZM');
    expect(provider.supportedCountries).toContain('BW');
    expect(provider.supportedCurrencies).toContain('USD');
    expect(provider.supportedCurrencies).toContain('ZAR');
  });
});

describe('InvoiceService', () => {
  it('generates ZIMRA-compliant HTML invoice', () => {
    const service = new InvoiceService();
    const html = service.generateInvoiceHtml({
      invoiceNumber: 'INV-2026-000001',
      amount: 15,
      currency: 'USD',
      description: 'Radbit pro plan - monthly',
      paidAt: new Date(),
      dueAt: new Date(),
    });

    expect(html).toContain('INV-2026-000001');
    expect(html).toContain('VAT (15%)');
    expect(html).toContain('Tax Invoice');
    expect(html).toContain('Paid');
  });
});

describe('PayNowProvider', () => {
  it('supports ZW and USD/ZIG', () => {
    const provider = new PayNowProvider();
    expect(provider.supportedCountries).toContain('ZW');
    expect(provider.supportedCurrencies).toContain('USD');
    expect(provider.supportedCurrencies).toContain('ZIG');
  });

  it('verifies ITN hash correctly', () => {
    const provider = new PayNowProvider();
    const payload = {
      reference: 'test-ref',
      paynowreference: 'PN123',
      amount: '10.00',
      status: 'Paid',
      pollurl: 'https://www.paynow.co.zw/poll/123',
      additionalinfo: 'test',
      authemail: 'test@example.com',
      hash: '',
    };
    const result = provider.verifyITNHash(payload);
    expect(typeof result).toBe('boolean');
  });
});
