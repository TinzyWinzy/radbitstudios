import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/sqlite';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'Heartbeat' });

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const timestamp = new Date().toISOString();

  try {
    const { rows } = await getPool().query('SELECT 1 AS ok');
    const ok = rows[0]?.ok === 1;
    return NextResponse.json({ ok, database: 'postgres', timestamp });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PostgreSQL unavailable';
    log.warn({ err }, 'Heartbeat: PostgreSQL unreachable');
    return NextResponse.json(
      { ok: false, database: 'unavailable', timestamp, error: message },
      { status: 503 }
    );
  }
}

export const POST = GET;