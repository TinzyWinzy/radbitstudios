import { afterEach, describe, expect, it, vi } from 'vitest';
import { DISABLED_API_PREFIXES, DISABLED_PAGE_PREFIXES, matchesDisabledPrefix } from '@/lib/product-availability';
import {
  getFiscalComplianceStatus,
  listFiscalReceipts,
  registerFiscalDevice,
  submitFiscalReceipt,
} from '@/services/zimra-fiscal';
import {
  createNewsletterUnsubscribeToken,
  verifyNewsletterUnsubscribeToken,
} from '@/lib/newsletter-unsubscribe';

describe('compliance remediation controls', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('blocks regulated and payment routes through the shared availability gate', () => {
    expect(matchesDisabledPrefix('/diaspora/invest', DISABLED_PAGE_PREFIXES)).toBe(true);
    expect(matchesDisabledPrefix('/api/fiscal/receipt', DISABLED_API_PREFIXES)).toBe(true);
    expect(matchesDisabledPrefix('/api/tender/armor', DISABLED_API_PREFIXES)).toBe(true);
    expect(matchesDisabledPrefix('/api/payments', DISABLED_API_PREFIXES)).toBe(true);
  });

  it('keeps fiscal registration and receipt operations disabled at the service layer', async () => {
    await expect(registerFiscalDevice('user-1', 'software')).resolves.toMatchObject({ success: false });
    await expect(submitFiscalReceipt('user-1', { totalAmount: 10 })).resolves.toMatchObject({ success: false });
    await expect(getFiscalComplianceStatus('user-1')).resolves.toMatchObject({ status: 'unavailable' });
    await expect(listFiscalReceipts('user-1')).resolves.toEqual([]);
  });

  it('requires a server-generated token for newsletter unsubscribe links', () => {
    vi.stubEnv('NEWSLETTER_UNSUBSCRIBE_SECRET', 'test-only-secret');
    const token = createNewsletterUnsubscribeToken('Person@Example.com');
    expect(token).toHaveLength(64);
    expect(verifyNewsletterUnsubscribeToken('person@example.com', token!)).toBe(true);
    expect(verifyNewsletterUnsubscribeToken('other@example.com', token!)).toBe(false);
  });
});
