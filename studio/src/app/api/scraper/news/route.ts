import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllFeeds } from '@/services/news-scraper';
import { invalidateCache } from '@/lib/scraper-cache';
import { verifySession } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;
  const user = await verifySession(request);

  if (expectedToken && authHeader !== `Bearer ${expectedToken}` && !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get('force') === 'true';
  if (force) {
    invalidateCache('news:');
  }

  try {
    const results = await scrapeAllFeeds();
    return NextResponse.json({
      success: true,
      scraped: results.scraped,
      errors: results.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('[API /api/scraper/news] Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await verifySession(request);
  if (!user || !['admin', 'super_admin'].includes((user as Record<string, unknown>)['role'] as string || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await scrapeAllFeeds();
    return NextResponse.json({
      success: true,
      scraped: results.scraped,
      errors: results.errors,
      timestamp: new Date().toISOString(),
      articles: results.articles,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
