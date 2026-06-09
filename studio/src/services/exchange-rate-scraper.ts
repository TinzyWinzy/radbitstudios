import { getCached, setCached } from '@/lib/scraper-cache';

export interface ExchangeRate {
  pair: string;
  bid: number;
  ask: number;
  mid: number;
  source: string;
  label: string;
  fetchedAt: Date;
}

export interface ExchangeRateSnapshot {
  rates: ExchangeRate[];
  officialZiGPerUSD: number;
  blackMarketBuyZiGPerUSD: number;
  blackMarketSellZiGPerUSD: number;
  fetchedAt: Date;
}

interface ZimrateEntry {
  currency: string;
  rate: number;
  name: string;
  last_checked: number;
  last_updated: number;
  url: string;
}

function parseZimrateResponse(data: { USD: ZimrateEntry[] }): ExchangeRate[] {
  const rates: ExchangeRate[] = [];
  const now = new Date();

  for (const entry of data.USD) {
    const rate = entry.rate;
    let pair: string;
    let bid: number;
    let ask: number;
    let mid: number;
    let label: string;

    if (entry.currency === 'ZWG') {
      pair = 'ZiG/USD';
      mid = rate;
      if (entry.name.includes('Black Market (Buy USD)')) {
        bid = rate;
        ask = rate;
        label = 'black_market_buy';
      } else if (entry.name.includes('Black Market (Sell USD)')) {
        bid = rate;
        ask = rate;
        label = 'black_market_sell';
      } else if (entry.name.includes('Cash Rate')) {
        bid = rate;
        ask = rate;
        label = 'cash_rate';
      } else if (entry.name.includes('Maximum Rate')) {
        bid = rate;
        ask = rate;
        label = 'max_business_rate';
      } else if (entry.name.includes('OK Supermarket')) {
        bid = rate;
        ask = rate;
        label = 'business_ok';
      } else if (entry.name.includes('Pick N Pay')) {
        bid = rate;
        ask = rate;
        label = 'business_picknpay';
      } else if (entry.name.includes('Sai Mart')) {
        bid = rate;
        ask = rate;
        label = 'business_saimart';
      } else if (entry.name.includes('Liquid Home')) {
        bid = rate;
        ask = rate;
        label = 'business_liquid';
      } else {
        bid = rate;
        ask = rate;
        label = 'official';
      }
    } else {
      pair = `ZiG/${entry.currency}`;
      label = `cross_${entry.currency}`;
      mid = rate;
      bid = rate;
      ask = rate;
    }

    rates.push({ pair, bid, ask, mid, source: 'zimpricecheck', label, fetchedAt: now });
  }

  return rates;
}

async function fetchZimrateApi(): Promise<ExchangeRate[]> {
  try {
    const res = await fetch('https://zimrate.tyganeutronics.com/api/v1', {
      signal: AbortSignal.timeout(8000),
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; RadbitSME/1.0)' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.USD?.length) return [];
    return parseZimrateResponse(data as { USD: ZimrateEntry[] });
  } catch {
    return [];
  }
}

async function fetchZimPriceCheckHtml(): Promise<ExchangeRate[]> {
  try {
    const res = await fetch('https://zimpricecheck.com/price-updates/official-and-black-market-exchange-rates/', {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RadbitSME/1.0)' },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const rates: ExchangeRate[] = [];
    const now = new Date();

    const tablePattern = /<td[^>]*>([\d.]+)\s*ZiG\s*<\/td>\s*<td[^>]*>(?:US\$)?([\d.]+)\s*<\/td>/gi;
    let match;
    while ((match = tablePattern.exec(html)) !== null) {
      const zigAmount = parseFloat(match[1]);
      const usdAmount = parseFloat(match[2]);
      if (!isNaN(zigAmount) && !isNaN(usdAmount) && usdAmount > 0) {
        rates.push({
          pair: 'ZiG/USD',
          mid: zigAmount / usdAmount,
          bid: zigAmount / usdAmount,
          ask: zigAmount / usdAmount,
          source: 'zimpricecheck-html',
          label: 'official',
          fetchedAt: now,
        });
      }
    }

    const rateSpans = html.match(/<strong[^>]*>([\d.]+)\s*ZiG\s*<\/strong>/gi);
    if (rateSpans) {
      for (const span of rateSpans) {
        const val = parseFloat(span.replace(/<[^>]+>/g, '').replace('ZiG', '').trim());
        if (!isNaN(val) && val > 0) {
          rates.push({
            pair: 'ZiG/USD',
            mid: val,
            bid: val,
            ask: val,
            source: 'zimpricecheck-html',
            label: 'rate_mention',
            fetchedAt: now,
          });
        }
      }
    }

    return rates;
  } catch {
    return [];
  }
}

export async function getExchangeRates(): Promise<ExchangeRateSnapshot> {
  const cacheKey = 'exchange:rates:all';
  const cached = getCached<ExchangeRateSnapshot>(cacheKey);
  if (cached && Date.now() - cached.fetchedAt.getTime() < 60 * 60 * 1000) {
    return cached;
  }

  let rates = await fetchZimrateApi();

  if (rates.length === 0) {
    rates = await fetchZimPriceCheckHtml();
  }

  const allRates = rates.length > 0 ? rates : getEstimatedRates();

  const official = allRates.find(r => r.label === 'official');
  const blackBuy = allRates.find(r => r.label === 'black_market_buy');
  const blackSell = allRates.find(r => r.label === 'black_market_sell');

  const snapshot: ExchangeRateSnapshot = {
    rates: allRates,
    officialZiGPerUSD: official?.mid ?? 26.9181,
    blackMarketBuyZiGPerUSD: blackBuy?.mid ?? 33,
    blackMarketSellZiGPerUSD: blackSell?.mid ?? 30,
    fetchedAt: new Date(),
  };

  setCached(cacheKey, snapshot, 60 * 60 * 1000);
  return snapshot;
}

function getEstimatedRates(): ExchangeRate[] {
  const now = new Date();
  return [
    { pair: 'ZiG/USD', bid: 26.50, ask: 27.00, mid: 26.75, source: 'estimate', label: 'official', fetchedAt: now },
    { pair: 'ZiG/USD', bid: 33.00, ask: 33.00, mid: 33.00, source: 'estimate', label: 'black_market_buy', fetchedAt: now },
    { pair: 'ZiG/USD', bid: 30.00, ask: 30.00, mid: 30.00, source: 'estimate', label: 'black_market_sell', fetchedAt: now },
    { pair: 'ZiG/ZAR', bid: 0.60, ask: 0.61, mid: 0.605, source: 'estimate', label: 'cross_ZAR', fetchedAt: now },
    { pair: 'USD/ZiG', bid: 0.037, ask: 0.038, mid: 0.0375, source: 'estimate', label: 'usd_per_zig', fetchedAt: now },
  ];
}

export function formatRateSummary(snapshot: ExchangeRateSnapshot): string {
  const lines = snapshot.rates.map(r =>
    `${r.pair} (${r.label}): ${r.mid.toFixed(4)} — ${r.source}`,
  );
  return [
    `Exchange Rates (as of ${snapshot.fetchedAt.toISOString().slice(0, 16)}):`,
    `Official: 1 USD = ${snapshot.officialZiGPerUSD.toFixed(4)} ZiG`,
    `Black Market Buy: 1 USD = ${snapshot.blackMarketBuyZiGPerUSD.toFixed(2)} ZiG`,
    `Black Market Sell: 1 USD = ${snapshot.blackMarketSellZiGPerUSD.toFixed(2)} ZiG`,
    ...lines.filter(l => !l.includes('(official)') && !l.includes('(black_market')),
  ].join('\n');
}
