import { NextRequest, NextResponse } from 'next/server';
import { checkForThreatEvents, initializeMonitorSources } from '@/services/reti-monitor';
import { logger } from '@/lib/logger';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

const log = logger.child({ module: 'RETIScan' });

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) return false;
  return true;
}

export const POST = withIpRateLimit(RateLimits.mutation, async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initializeMonitorSources();
    const count = await checkForThreatEvents();

    log.info(`RETI scan complete: ${count} new threat assessments generated`);

    return NextResponse.json({
      success: true,
      assessmentsGenerated: count,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'RETI scan failed';
    log.error({ err }, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const GET = withIpRateLimit(RateLimits.apiDefault, async () => {
  try {
    const { adminDb } = await import('@/lib/firebase/firebase-admin');
    const snap = await adminDb.collection('reti_monitor_sources').get();

    const sources = snap.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      category: doc.data().category,
      lastChecked: doc.data().lastChecked,
      active: doc.data().active,
    }));

    return NextResponse.json({ sources });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list sources';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});