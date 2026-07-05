import { NextRequest, NextResponse } from 'next/server';
import { scrapeSource } from '@/services/tender/scrape-engine';
import { TENDER_SOURCES } from '@/services/tender/configs';
import type { Tender } from '@/services/tender/types';

const SADC_SOURCES = TENDER_SOURCES.filter(s => ['PPADB Botswana', 'ZPPA Zambia', 'CNU Mozambique', 'PPDA Malawi', 'sa-etenders', 'AfDB'].includes(s.name));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const sector = searchParams.get('sector');

    let sources = SADC_SOURCES;
    if (country) {
      const countryMap: Record<string, string[]> = {
        botswana: ['PPADB Botswana'],
        zambia: ['ZPPA Zambia'],
        mozambique: ['CNU Mozambique'],
        malawi: ['PPDA Malawi'],
        'south-africa': ['sa-etenders'],
        africa: ['AfDB'],
      };
      const names = countryMap[country.toLowerCase()];
      if (names) sources = SADC_SOURCES.filter(s => names.includes(s.name));
    }

    const settled = await Promise.allSettled(sources.map(cfg => scrapeSource(cfg)));
    const allTenders: Tender[] = [];
    const errors: string[] = [];

    for (let i = 0; i < settled.length; i++) {
      const result = settled[i];
      if (result.status === 'fulfilled') {
        allTenders.push(...result.value);
      } else {
        errors.push(`${sources[i].name}: ${result.reason?.slice(0, 100) || 'unknown'}`);
      }
    }

    const seen = new Set<string>();
    const unique = allTenders.filter(t => {
      const key = t.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    let filtered = unique;
    if (sector) {
      filtered = filtered.filter(t => t.sector?.toLowerCase().includes(sector.toLowerCase()));
    }

    return NextResponse.json({
      count: filtered.length,
      total: unique.length,
      errors: errors.length > 0 ? errors : undefined,
      tenders: filtered.slice(0, 50),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const settled = await Promise.allSettled(SADC_SOURCES.map(cfg => scrapeSource(cfg)));
    let scraped = 0;
    const errors: string[] = [];

    for (let i = 0; i < settled.length; i++) {
      const result = settled[i];
      if (result.status === 'fulfilled') {
        scraped += result.value.length;
      } else {
        errors.push(`${SADC_SOURCES[i].name}: ${String(result.reason).slice(0, 100)}`);
      }
    }

    return NextResponse.json({ scraped, errors: errors.length, details: errors.length > 0 ? errors : undefined });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
