import { NextRequest, NextResponse } from 'next/server';
import {
  getFiscalComplianceStatus, registerFiscalDevice, getFiscalThresholds, getFiscalComplianceGuide,
  openFiscalDay, closeFiscalDay, submitFiscalReceipt, submitOfflineFile,
} from '@/services/zimra-fiscal';
import { adminAuth } from '@/lib/firebase/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.has('guide')) {
      return NextResponse.json({ guide: getFiscalComplianceGuide(), thresholds: getFiscalThresholds() });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const status = await getFiscalComplianceStatus(decoded.uid);
    return NextResponse.json(status);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const body = await request.json();

    switch (body.action) {
      case 'register':
        return NextResponse.json(await registerFiscalDevice(decoded.uid, body.deviceType || 'software', body.operatingMode || 'online'));
      case 'open_day':
        return NextResponse.json(await openFiscalDay(decoded.uid));
      case 'close_day':
        return NextResponse.json(await closeFiscalDay(decoded.uid));
      case 'submit_receipt':
        return NextResponse.json(await submitFiscalReceipt(decoded.uid, {
          receiptType: body.receiptType || 'FISCALINVOICE',
          currency: body.currency || 'USD',
          totalAmount: body.totalAmount || 0,
          vatAmount: body.vatAmount,
          description: body.description,
          taxLines: body.taxLines,
          submissionMode: body.submissionMode || 'online',
        }));
      case 'submit_file':
        return NextResponse.json(await submitOfflineFile(decoded.uid));
      default:
        return NextResponse.json({
          error: 'Invalid action. Use: register, open_day, close_day, submit_receipt, submit_file.',
        }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
