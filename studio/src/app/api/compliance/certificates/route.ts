import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/api-auth';
import { registerCertificate } from '@/services/compliance-tracker';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const verified = await verifyIdToken(token);
  if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const body = await request.json();
  const { type, label, expiryDate } = body;

  const validTypes = ['praz', 'zimra_tax_clearance', 'nssa', 'zimra_fiscal_device'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
  }
  if (!label || !expiryDate) {
    return NextResponse.json({ error: 'label and expiryDate required' }, { status: 400 });
  }

  const result = await registerCertificate(verified.uid, type, label, expiryDate);
  return NextResponse.json({ success: result }, { status: result ? 201 : 409 });
}
