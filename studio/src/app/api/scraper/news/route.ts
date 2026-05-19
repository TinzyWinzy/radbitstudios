import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllFeeds } from '@/services/news-scraper';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await scrapeAllFeeds();
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