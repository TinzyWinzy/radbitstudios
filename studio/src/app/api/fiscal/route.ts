import { NextRequest, NextResponse } from 'next/server';
import { getFiscalComplianceStatus, registerFiscalDevice, getFiscalThresholds, getFiscalComplianceGuide } from '@/services/zimra-fiscal';
import { adminAuth } from '@/lib/firebase/firebase-admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (searchParams.has('guide')) {
    return NextResponse.json({ guide: getFiscalComplianceGuide(), thresholds: getFiscalThresholds() });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const status = await getFiscalComplianceStatus(decoded.uid);
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const body = await request.json();
    const result = await registerFiscalDevice(decoded.uid, body.deviceType || 'software');
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
