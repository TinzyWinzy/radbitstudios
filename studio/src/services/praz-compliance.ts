import { adminDb } from '@/lib/firebase/firebase-admin';

export const REQUIRED_DOCUMENTS = [
  { id: 'cert_incorporation', label: 'Certificate of Incorporation', description: 'Company registration document from the Registrar of Companies', perpetual: true },
  { id: 'cr14', label: 'CR14 — List of Shareholders', description: 'Current list of shareholders filed with the Registrar', perpetual: true },
  { id: 'cr6', label: 'CR6 — List of Directors', description: 'Current list of directors filed with the Registrar', perpetual: true },
  { id: 'itf263', label: 'ZIMRA Tax Clearance (ITF263)', description: 'Valid tax clearance certificate' },
  { id: 'nssa', label: 'NSSA Compliance Certificate', description: 'National Social Security Authority compliance' },
  { id: 'business_license', label: 'Business Operating License', description: 'Local council or sector-specific operating license' },
  { id: 'proof_residence', label: 'Proof of Residence (Directors)', description: 'Utility bill or bank statement for each director' },
] as const;

export type DocumentId = typeof REQUIRED_DOCUMENTS[number]['id'];

export interface PrazDocument {
  id: string;
  userId: string;
  docType: DocumentId;
  fileName: string;
  storagePath: string;
  uploadedAt: Date;
  expiresAt: Date | null;
  status: 'valid' | 'expiring_soon' | 'expired' | 'missing';
}

export interface PrazProfile {
  userId: string;
  companyName: string;
  registrationNumber: string;
  companyType: 'pvt' | 'pbc' | 'sole_trader' | 'other';
  documents: Record<DocumentId, PrazDocument | null>;
  readinessScore: number;
  updatedAt: Date;
}

export async function getPrazProfile(userId: string): Promise<{
  documents: Record<string, { docType: DocumentId; fileName: string; uploadedAt: Date; expiresAt: Date | null; status: string }>;
  readinessScore: number;
  companyName: string;
  registrationNumber: string;
}> {
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
      uploadedAt: data.uploadedAt?.toDate() || new Date(),
      expiresAt,
      status,
    };
  }

  const uploadedCount = Object.values(documents).filter(Boolean).length;
  const readinessScore = Math.round((uploadedCount / REQUIRED_DOCUMENTS.length) * 100);

  return { documents, readinessScore, companyName: '', registrationNumber: '' };
}

export async function savePrazDocument(
  userId: string,
  docType: DocumentId,
  fileName: string,
  fileUrl: string,
  expiresAt: string | null,
): Promise<void> {
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
}

export async function deletePrazDocument(userId: string, docType: DocumentId): Promise<void> {
  await adminDb.collection('praz_documents').doc(`${userId}_${docType}`).delete();
}
