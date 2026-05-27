import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { verifySession } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { docType, fileName, fileUrl, expiresAt } = body;

  if (!docType || !fileName || !fileUrl) {
    return NextResponse.json({ error: 'docType, fileName, fileUrl required' }, { status: 400 });
  }

  const docRef = adminDb.collection('praz_documents').doc(`${user.uid}_${docType}`);
  await docRef.set({
    userId: user.uid,
    docType,
    fileName,
    fileUrl,
    uploadedAt: new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    status: 'valid',
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const docType = req.nextUrl.searchParams.get('docType');
  if (!docType) {
    return NextResponse.json({ error: 'docType required' }, { status: 400 });
  }

  await adminDb.collection('praz_documents').doc(`${user.uid}_${docType}`).delete();

  return NextResponse.json({ success: true });
}
