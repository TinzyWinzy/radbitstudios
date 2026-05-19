import { NextResponse } from 'next/server';
import { upsertNewsBatch, getNews, getDbStats } from '@/lib/sqlite';

export async function GET() {
  try {
    const stats = getDbStats();
    const news = getNews({ limit: 10 });

    return NextResponse.json({
      stats,
      newsCount: news.length,
      news: news.map(n => ({ id: n.id, title: n.title?.slice(0, 50) })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const testArticles = [
      { id: 'test-1', title: 'Test Article 1', sourceName: 'Test', publishedAt: new Date(), category: 'general' },
      { id: 'test-2', title: 'Test Article 2', sourceName: 'Test', publishedAt: new Date(), category: 'general' },
      { id: 'test-3', title: 'Test Article 3', sourceName: 'Test', publishedAt: new Date(), category: 'general' },
    ];

    const count = upsertNewsBatch(testArticles);
    const news = getNews({ limit: 10 });

    return NextResponse.json({
      inserted: count,
      totalInDb: news.length,
      news: news.map(n => ({ id: n.id, title: n.title })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
