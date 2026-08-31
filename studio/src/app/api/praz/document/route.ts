import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { adminDb, adminStorage } from '@/lib/firebase/firebase-admin';
import { verifySession } from '@/lib/api-auth';
import { validateBody, PrazDocumentSchema, PrazDeleteSchema } from '@/lib/api-validation';

export const POST = withIpRateLimit(
  { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:praz-doc' },
  async (req: NextRequest) => {
  try {
    const user = await verifySession(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validation = await validateBody(req, PrazDocumentSchema);
    if (!validation.success) return validation.response;

    const { docType, fileName, storagePath, expiresAt } = validation.data;
    if (!storagePath.startsWith(`praz/${user.uid}/`)) {
      return NextResponse.json({ error: 'Invalid storage owner' }, { status: 403 });
    }

    const docRef = adminDb.collection('praz_documents').doc(`${user.uid}_${docType}`);
    await docRef.set({
      userId: user.uid,
      docType,
      fileName,
      storagePath,
      uploadedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: 'valid',
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
},
);

export const DELETE = withIpRateLimit(
  { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:praz-doc-delete' },
  async (req: NextRequest) => {
  try {
    const user = await verifySession(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const docType = req.nextUrl.searchParams.get('docType');
    const validation = PrazDeleteSchema.safeParse({ docType });
    if (!validation.success) {
      return NextResponse.json({ error: 'docType required' }, { status: 400 });
    }

    const docRef = adminDb.collection('praz_documents').doc(`${user.uid}_${validation.data.docType}`);
    const doc = await docRef.get();
    const storagePath = doc.data()?.storagePath;
    if (typeof storagePath === 'string' && storagePath.startsWith(`praz/${user.uid}/`)) {
      await adminStorage.bucket().file(storagePath).delete({ ignoreNotFound: true });
    }
    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
},
);
