import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllFeeds } from '@/services/news-scraper';
import { invalidateCache } from '@/lib/scraper-cache';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get('force') === 'true';
  if (force) {
    invalidateCache('news:');
  }

  try {
    console.log('[API /api/scraper/news] Starting scrape...');
    const results = await scrapeAllFeeds();
    console.log(`[API /api/scraper/news] Scrape complete: ${results.scraped} scraped, ${results.errors} errors`);
    return NextResponse.json({
      success: true,
      scraped: results.scraped,
      errors: results.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /api/scraper/news] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const results = await scrapeAllFeeds();
    return NextResponse.json({ ok: true, ...results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}