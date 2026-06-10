import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { ReferralService } from '@/services/referral.service';
import { verifyIdToken } from '@/lib/api-auth';

export const POST = withIpRateLimit(
  { maxRequests: 10, windowMs: 60 * 1000, keyPrefix: 'ratelimit:referral-generate' },
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const verified = await verifyIdToken(idToken);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const service = new ReferralService();
    const code = await service.generateCode(verified.uid);

    return NextResponse.json({ success: true, code });
  } catch (error: unknown) {
    console.error('[Referral Generate] Error:', error);
    return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
  }
},
);
