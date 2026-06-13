import { NextResponse } from 'next/server';
import { checkForThreatEvents, initializeMonitorSources } from '@/services/reti-monitor';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'RETIScan' });

export async function POST() {
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
}

export async function GET() {
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
}
