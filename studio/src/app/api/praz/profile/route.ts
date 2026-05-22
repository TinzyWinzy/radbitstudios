import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { REQUIRED_DOCUMENTS } from '@/services/praz-types';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const snap = await adminDb.collection('praz_documents')
    .where('userId', '==', userId)
    .get();

  const documents: Record<string, any> = {};
  for (const doc of REQUIRED_DOCUMENTS) {
    documents[doc.id] = null;
  }

  for (const d of snap.docs) {
    const data = d.data();
    const expiresAt = data.expiresAt?.toDate() || null;
    let status = 'valid';
    if (!data.uploadedAt) {
      status = 'missing';
    } else if (expiresAt) {
      const daysUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry < 0) status = 'expired';
      else if (daysUntilExpiry < 30) status = 'expiring_soon';
    }
    documents[data.docType] = {
      docType: data.docType,
      fileName: data.fileName,
      uploadedAt: data.uploadedAt?.toDate()?.toISOString() || new Date().toISOString(),
      expiresAt: expiresAt?.toISOString() || null,
      status,
    };
  }

  const uploadedCount = Object.values(documents).filter(Boolean).length;
  const readinessScore = Math.round((uploadedCount / REQUIRED_DOCUMENTS.length) * 100);

  return NextResponse.json({ documents, readinessScore, companyName: '', registrationNumber: '' });
}
