export const AFFILIATE_IDS = {
  ecocash: 'YOUR_ECOCASH_AFFILIATE_ID',
  paynow: 'YOUR_PAYNOW_AFFILIATE_ID',
  solar: 'YOUR_SOLAR_AFFILIATE_ID',
  courier: 'YOUR_COURIER_AFFILIATE_ID',
} as const;

export const affiliateLinks = {
  'ecocash-business': {
    url: 'https://www.ecocash.co.zw/business',
    program: 'ecocash' as const,
    title: 'EcoCash Business Solutions',
  },
  'paynow': {
    url: 'https://www.paynow.co.zw',
    program: 'paynow' as const,
    title: 'PayNow Zimbabwe',
  },
  'solar-company': {
    url: 'https://example.com/solar',
    program: 'solar' as const,
    title: 'Solar Energy for SMEs',
  },
  'courier-service': {
    url: 'https://example.com/courier',
    program: 'courier' as const,
    title: 'Courier and Delivery Services',
  },
  'zimra': {
    url: 'https://www.zimra.co.zw',
    program: null,
    title: 'ZIMRA — Zimbabwe Revenue Authority',
  },
  'rbz': {
    url: 'https://www.rbz.co.zw',
    program: null,
    title: 'Reserve Bank of Zimbabwe',
  },
} as const;

export type AffiliateSlug = keyof typeof affiliateLinks;

export function getAffiliateUrl(slug: AffiliateSlug): string {
  const link = affiliateLinks[slug];
  const { url, program } = link;
  if (!program) return url;

  const id = AFFILIATE_IDS[program];
  if (!id || id.startsWith('YOUR_')) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}ref=${id}`;
}
