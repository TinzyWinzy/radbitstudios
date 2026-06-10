import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { DiasporaProfileSchema } from '@/lib/api-validation';
import { verifyIdToken } from '@/lib/api-auth';

const rlRead = { maxRequests: 60, windowMs: 60 * 1000, keyPrefix: 'ratelimit:diaspora-profile' };
const rlWrite = { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:diaspora-profile-write' };

export const GET = withIpRateLimit(rlRead, async (req: NextRequest): Promise<NextResponse> => {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const verified = await verifyIdToken(token);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const doc = await adminDb.collection('diaspora_investors').doc(verified.uid).get();
    if (!doc.exists) {
      return NextResponse.json({ profile: null });
    }

    const data = doc.data();
    return NextResponse.json({
      profile: {
        countryOfResidence: data?.countryOfResidence || '',
        maxTicketSize: data?.maxTicketSize || '',
        targetSectors: data?.targetSectors || [],
      },
    });
  } catch (error: unknown) {
    console.error('[Diaspora Profile GET] Error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
});

export const POST = withIpRateLimit(rlWrite, async (req: NextRequest): Promise<NextResponse> => {
  try {
    const body = await req.json();
    const parsed = DiasporaProfileSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { error: `Validation: ${firstError.path.join('.')} — ${firstError.message}` },
        { status: 400 },
      );
    }

    const { idToken, countryOfResidence, maxTicketSize, targetSectors } = parsed.data;

    const verified = await verifyIdToken(idToken);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await adminDb.collection('diaspora_investors').doc(verified.uid).set(
      {
        countryOfResidence,
        maxTicketSize,
        targetSectors,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true, message: 'Profile saved' });
  } catch (error: unknown) {
    console.error('[Diaspora Profile POST] Error:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
});
