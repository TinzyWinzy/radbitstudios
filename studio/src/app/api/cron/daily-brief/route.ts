import { NextResponse } from 'next/server';
import { sendBulkDailyBriefs } from '@/services/daily-brief-service';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendBulkDailyBriefs('daily');
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
