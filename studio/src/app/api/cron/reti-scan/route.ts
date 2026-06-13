import { NextResponse } from 'next/server';
import { checkForThreatEvents, initializeMonitorSources } from '@/services/reti-monitor';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initializeMonitorSources();
    const count = await checkForThreatEvents();
    return NextResponse.json({
      success: true,
      assessmentsGenerated: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'RETI scan failed';
    console.error('[CRON reti-scan] Error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
