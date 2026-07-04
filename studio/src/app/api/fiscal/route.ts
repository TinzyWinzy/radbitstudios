import { NextRequest, NextResponse } from 'next/server';
import { getFiscalComplianceStatus, registerFiscalDevice, getFiscalThresholds, getFiscalComplianceGuide } from '@/services/zimra-fiscal';
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
    const result = await registerFiscalDevice(decoded.uid, body.deviceType || 'software');
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
