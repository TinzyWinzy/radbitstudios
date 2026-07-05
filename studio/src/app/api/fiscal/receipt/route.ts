import { NextRequest, NextResponse } from 'next/server';
import { listFiscalReceipts } from '@/services/zimra-fiscal';
import { adminAuth } from '@/lib/firebase/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const receipts = await listFiscalReceipts(decoded.uid);
    return NextResponse.json({ count: receipts.length, receipts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
