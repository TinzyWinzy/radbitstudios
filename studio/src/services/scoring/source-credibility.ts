const SOURCE_CREDIBILITY: Record<string, { confidence: number; tier: 'official' | 'major' | 'minor' | 'unknown' }> = {
  'proc.gov.zw': { confidence: 95, tier: 'official' },
  'praz.gov.zw': { confidence: 95, tier: 'official' },
  'zimra.co.zw': { confidence: 95, tier: 'official' },
  'idbz.co.zw': { confidence: 90, tier: 'official' },
  'undp.org': { confidence: 90, tier: 'official' },
  'stanbicbank.co.zw': { confidence: 80, tier: 'major' },
  'tendersonime.com': { confidence: 70, tier: 'major' },
  'tendersinfo.com': { confidence: 60, tier: 'minor' },
  'herald.co.zw': { confidence: 80, tier: 'major' },
  'chronicle.co.zw': { confidence: 75, tier: 'major' },
  'newsday.co.zw': { confidence: 70, tier: 'major' },
  'bulawayo24.com': { confidence: 50, tier: 'minor' },
  'thezimbabwemail.co.zw': { confidence: 60, tier: 'minor' },
  'zimeye.net': { confidence: 40, tier: 'minor' },
  'techzim.co.zw': { confidence: 75, tier: 'major' },
  'finx.co.zw': { confidence: 65, tier: 'minor' },
  'southerneye.co.zw': { confidence: 60, tier: 'minor' },
  'dailynews.co.zw': { confidence: 65, tier: 'minor' },
  'zbcnews.co.zw': { confidence: 70, tier: 'major' },
  '263chat.com': { confidence: 40, tier: 'minor' },
};

export function getSourceConfidence(sourceUrl: string): number {
  try {
    const hostname = new URL(sourceUrl).hostname.replace('www.', '');
    const match = Object.entries(SOURCE_CREDIBILITY).find(([domain]) => hostname.includes(domain) || domain.includes(hostname));
    if (match) return match[1].confidence;

    const tier = SOURCE_CREDIBILITY[hostname];
    return tier?.confidence ?? 30;
  } catch {
    return 30;
  }
}

export function getSourceTier(sourceUrl: string): 'official' | 'major' | 'minor' | 'unknown' {
  try {
    const hostname = new URL(sourceUrl).hostname.replace('www.', '');
    const match = Object.entries(SOURCE_CREDIBILITY).find(([domain]) => hostname.includes(domain) || domain.includes(hostname));
    if (match) return match[1].tier;
    const tier = SOURCE_CREDIBILITY[hostname];
    return tier?.tier ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export function scoreUrgency(publishedAt: Date, closingDate?: Date | null): number {
  if (closingDate) {
    const daysLeft = Math.ceil((closingDate.getTime() - Date.now()) / 86400000);
    if (daysLeft <= 0) return 0;
    if (daysLeft <= 3) return 100;
    if (daysLeft <= 7) return 80;
    if (daysLeft <= 14) return 60;
    if (daysLeft <= 30) return 40;
    return 20;
  }

  const daysAgo = Math.ceil((Date.now() - publishedAt.getTime()) / 86400000);
  if (daysAgo <= 1) return 100;
  if (daysAgo <= 3) return 80;
  if (daysAgo <= 7) return 60;
  if (daysAgo <= 14) return 40;
  if (daysAgo <= 30) return 20;
  return 0;
}
