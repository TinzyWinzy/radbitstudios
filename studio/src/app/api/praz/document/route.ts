import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, docType, fileName, fileUrl, expiresAt } = body;

  if (!userId || !docType || !fileName || !fileUrl) {
    return NextResponse.json({ error: 'userId, docType, fileName, fileUrl required' }, { status: 400 });
  }

  const docRef = adminDb.collection('praz_documents').doc(`${userId}_${docType}`);
  await docRef.set({
    userId,
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
  const userId = req.nextUrl.searchParams.get('userId');
  const docType = req.nextUrl.searchParams.get('docType');

  if (!userId || !docType) {
    return NextResponse.json({ error: 'userId and docType required' }, { status: 400 });
  }

  await adminDb.collection('praz_documents').doc(`${userId}_${docType}`).delete();

  return NextResponse.json({ success: true });
}
