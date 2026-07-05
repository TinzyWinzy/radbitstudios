import { NextResponse } from 'next/server';
import { scrapeSource } from '@/services/tender/scrape-engine';
import { TENDER_SOURCES } from '@/services/tender/configs';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const SADC_SOURCES = TENDER_SOURCES.filter(s => ['PPADB Botswana', 'ZPPA Zambia', 'CNU Mozambique', 'PPDA Malawi'].includes(s.name));

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    return NextResponse.json({
      scraped,
      errors: errors.length,
      details: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
