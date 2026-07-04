import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/api-auth';
import { getVerifiedSmes, getSmeSnapshot } from '@/services/diaspora-verification';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const smeId = searchParams.get('smeId');

    if (smeId) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const verified = await verifyIdToken(token);
      if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

      const snapshot = await getSmeSnapshot(smeId);
      if (!snapshot) return NextResponse.json({ error: 'SME not found' }, { status: 404 });
      return NextResponse.json({ snapshot });
    }

    const snapshots = await getVerifiedSmes();
    return NextResponse.json({ smes: snapshots, count: snapshots.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
