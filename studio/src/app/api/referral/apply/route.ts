import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { ReferralService } from '@/services/referral.service';
import { verifyIdToken } from '@/lib/api-auth';

export const POST = withIpRateLimit(
  { maxRequests: 10, windowMs: 60 * 1000, keyPrefix: 'ratelimit:referral-apply' },
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { idToken, referralCode } = await req.json();
    if (!idToken || !referralCode) {
      return NextResponse.json({ error: 'Missing idToken or referralCode' }, { status: 400 });
    }

    const verified = await verifyIdToken(idToken);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const service = new ReferralService();
    const result = await service.applyReferral(referralCode, verified.uid);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: unknown) {
    console.error('[Referral Apply] Error:', error);
    return NextResponse.json({ error: 'Failed to apply referral code' }, { status: 500 });
  }
},
);
