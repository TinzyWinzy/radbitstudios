import type { AffiliateSlug } from './affiliate-links';

export function go(slug: AffiliateSlug): string {
  return `/api/go/${slug}`;
}

export { affiliateLinks, getAffiliateUrl, AFFILIATE_IDS } from './affiliate-links';
export type { AffiliateSlug } from './affiliate-links';
