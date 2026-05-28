import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { verifySession } from '@/lib/api-auth';
import { validateBody, PrazDocumentSchema, PrazDeleteSchema } from '@/lib/api-validation';

export async function POST(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const validation = await validateBody(req, PrazDocumentSchema);
  if (!validation.success) return validation.response;

  const { docType, fileName, fileUrl, expiresAt } = validation.data;

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
  const validation = PrazDeleteSchema.safeParse({ docType });
  if (!validation.success) {
    return NextResponse.json({ error: 'docType required' }, { status: 400 });
  }

  await adminDb.collection('praz_documents').doc(`${user.uid}_${validation.data.docType}`).delete();

  return NextResponse.json({ success: true });
}
