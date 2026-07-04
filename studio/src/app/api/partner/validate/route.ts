import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { ReferralService } from '@/services/referral.service';
import { validateBody, PartnerValidatePostSchema } from '@/lib/api-validation';

const referralService = new ReferralService();

export const POST = withIpRateLimit(
  { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:partner-validate-post' },
  async (req: NextRequest) => {
  try {
    const validation = await validateBody(req, PartnerValidatePostSchema);
    if (!validation.success) return validation.response;

    const { idToken, partnerCode } = validation.data;
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    const result = await referralService.applyReferral(partnerCode, decoded.uid);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      discountPercent: result.discountPercent,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
},
);

export const GET = withIpRateLimit(
  { maxRequests: 30, windowMs: 60 * 1000, keyPrefix: 'ratelimit:partner-validate' },
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const result = await referralService.validatePartnerCode(code);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
},
);
