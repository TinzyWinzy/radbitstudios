import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { verifySession } from '@/lib/api-auth';
import { crawlForSources } from '@/services/discovery/source-crawler';
import { classifySources } from '@/services/discovery/source-classifier';
import { saveDiscoveredSources, getPendingSources, addActiveSource, rejectSource } from '@/services/discovery/source-store';
import { validateBody, DiscoverySourcePatchSchema } from '@/lib/api-validation';

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Discovery] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await verifySession(req);
  if (!user || !['admin', 'super_admin'].includes((user as Record<string, unknown>)['role'] as string || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pending = await getPendingSources();
    return NextResponse.json({ pending });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await verifySession(req);
  if (!user || !['admin', 'super_admin'].includes((user as Record<string, unknown>)['role'] as string || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const validation = await validateBody(req, DiscoverySourcePatchSchema);
    if (!validation.success) return validation.response;

    const { sourceId, action, feedUrl } = validation.data;

    if (action === 'approve') {
      // Fetch the full source document before approving
      const sourceDoc = await adminDb.collection('discovered_sources').doc(sourceId).get();
      if (!sourceDoc.exists) {
        return NextResponse.json({ error: 'Source not found' }, { status: 404 });
      }
      const sourceData = sourceDoc.data() as Record<string, unknown>;
      await addActiveSource({
        id: sourceId,
        url: (sourceData?.url as string) || '',
        name: (sourceData?.name as string) || '',
        feedUrl: feedUrl || (sourceData?.feedUrl as string) || '',
        region: (sourceData?.region as string) || 'Zimbabwe',
        description: (sourceData?.description as string) || '',
        relevanceScore: (sourceData?.relevanceScore as number) || 0,
        qualityScore: (sourceData?.qualityScore as number) || 0,
        updateFrequency: 'weekly' as const,
        reasonForSelection: (sourceData?.reasonForSelection as string) || '',
        discoveredAt: (sourceData?.discoveredAt as string) || new Date().toISOString(),
        status: 'approved',
      }, feedUrl || (sourceData?.feedUrl as string) || '');
      return NextResponse.json({ status: 'approved' });
    }

    if (action === 'reject') {
      await rejectSource(sourceId);
      return NextResponse.json({ status: 'rejected' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
