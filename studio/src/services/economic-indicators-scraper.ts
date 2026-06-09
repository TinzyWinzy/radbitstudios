import { getCached, setCached } from '@/lib/scraper-cache';

export interface EconomicIndicators {
  goldPriceUSD: number;
  rbzPolicyRate: number;
  cpiMonthOverMonth: number | null;
  cpiYearOverYear: number | null;
  cpiMonth: string | null;
  fetchedAt: Date;
  sources: string[];
}

async function fetchGoldPrice(): Promise<number | null> {
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU', {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.price && typeof data.price === 'number') {
      return data.price;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getEconomicIndicators(): Promise<EconomicIndicators> {
  const cacheKey = 'economic:indicators';
  const cached = getCached<EconomicIndicators>(cacheKey);
  if (cached && Date.now() - cached.fetchedAt.getTime() < 6 * 60 * 60 * 1000) {
    return cached;
  }

  const sources: string[] = [];

  const goldPrice = await fetchGoldPrice();
  if (goldPrice) sources.push('gold-api.com');
  const finalGold = goldPrice ?? 4329.30;

  const indicators: EconomicIndicators = {
    goldPriceUSD: finalGold,
    rbzPolicyRate: 35,
    cpiMonthOverMonth: 0.51,
    cpiYearOverYear: 1.30,
    cpiMonth: 'March 2026',
    fetchedAt: new Date(),
    sources: sources.length > 0 ? sources : ['estimate'],
  };

  setCached(cacheKey, indicators, 6 * 60 * 60 * 1000);
  return indicators;
}

export function formatIndicatorSummary(indicators: EconomicIndicators): string {
  return [
    `Gold Price: US$${indicators.goldPriceUSD.toFixed(2)}/oz`,
    `RBZ Policy Rate: ${indicators.rbzPolicyRate}%`,
    indicators.cpiMonthOverMonth !== null ? `CPI (${indicators.cpiMonth}): M-o-M ${indicators.cpiMonthOverMonth.toFixed(2)}%, Y-o-Y ${indicators.cpiYearOverYear?.toFixed(2)}%` : '',
    `Sources: ${indicators.sources.join(', ')}`,
  ].filter(Boolean).join('\n');
}
