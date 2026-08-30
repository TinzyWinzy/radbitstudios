import { getCached, setCached } from '@/lib/scraper-cache';

export interface EconomicIndicators {
  goldPriceUSD: number | null;
  rbzPolicyRate: number | null;
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

  const indicators: EconomicIndicators = {
    goldPriceUSD: goldPrice,
    rbzPolicyRate: null,
    cpiMonthOverMonth: null,
    cpiYearOverYear: null,
    cpiMonth: null,
    fetchedAt: new Date(),
    sources,
  };

  setCached(cacheKey, indicators, 6 * 60 * 60 * 1000);
  return indicators;
}

export function formatIndicatorSummary(indicators: EconomicIndicators): string {
  const lines: string[] = [];
  lines.push(indicators.goldPriceUSD !== null ? `Gold Price: US$${indicators.goldPriceUSD.toFixed(2)}/oz` : 'Gold Price: unavailable');
  lines.push(indicators.rbzPolicyRate !== null ? `RBZ Policy Rate: ${indicators.rbzPolicyRate}%` : 'RBZ Policy Rate: unavailable');
  if (indicators.cpiMonthOverMonth !== null) {
    lines.push(`CPI (${indicators.cpiMonth}): M-o-M ${indicators.cpiMonthOverMonth.toFixed(2)}%, Y-o-Y ${indicators.cpiYearOverYear?.toFixed(2)}%`);
  } else {
    lines.push('CPI: unavailable');
  }
  lines.push(`Sources: ${indicators.sources.length > 0 ? indicators.sources.join(', ') : 'none'}`);
  return lines.join('\n');
}
