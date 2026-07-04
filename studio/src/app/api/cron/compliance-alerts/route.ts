import { NextResponse } from 'next/server';
import { sendComplianceAlerts } from '@/services/compliance-tracker';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendComplianceAlerts();
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
