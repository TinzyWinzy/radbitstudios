import { NextRequest, NextResponse } from 'next/server';
import { crawlForSources } from '@/services/discovery/source-crawler';
import { classifySources } from '@/services/discovery/source-classifier';
import { saveDiscoveredSources, getPendingSources, addActiveSource, rejectSource } from '@/services/discovery/source-store';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const expected = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;
    if (expected && authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Discovery] Starting source crawl...');
    const raw = await crawlForSources();
    console.log(`[Discovery] Found ${raw.length} candidate sources`);

    const classified = await classifySources(raw);
    console.log(`[Discovery] Classified ${classified.length} sources`);

    const highQuality = classified.filter(s => s.relevanceScore >= 60 && s.qualityScore >= 50);
    await saveDiscoveredSources(highQuality);

    return NextResponse.json({
      total: classified.length,
      highQuality: highQuality.length,
      sources: highQuality.map(s => ({ id: s.id, name: s.name, relevanceScore: s.relevanceScore, qualityScore: s.qualityScore })),
    });
  } catch (error: any) {
    console.error('[Discovery] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pending = await getPendingSources();
    return NextResponse.json({ pending });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceId, action, feedUrl } = body;

    if (!sourceId || !action) {
      return NextResponse.json({ error: 'sourceId and action required' }, { status: 400 });
    }

    if (action === 'approve') {
      await addActiveSource(
        { id: sourceId } as any,
        feedUrl || '',
      );
      return NextResponse.json({ status: 'approved' });
    }

    if (action === 'reject') {
      await rejectSource(sourceId);
      return NextResponse.json({ status: 'rejected' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
