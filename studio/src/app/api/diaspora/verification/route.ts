import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/api-auth';
import { submitVerificationRequest, getVerificationStatus } from '@/services/diaspora-verification';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const verified = await verifyIdToken(token);
  if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const status = await getVerificationStatus(verified.uid);
  return NextResponse.json({ verification: status });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const verified = await verifyIdToken(token);
  if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const body = await request.json();
  const { businessName, documents } = body;

  if (!businessName || !documents || !Array.isArray(documents)) {
    return NextResponse.json({ error: 'businessName and documents[] required' }, { status: 400 });
  }

  const result = await submitVerificationRequest(verified.uid, businessName, documents);
  return NextResponse.json(result, { status: result.success ? 201 : 409 });
}
