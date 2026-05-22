import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { ReferralService } from '@/services/referral.service';

const referralService = new ReferralService();

export async function POST(req: NextRequest) {
  try {
    const { idToken, partnerCode } = await req.json();
    if (!idToken || !partnerCode) {
      return NextResponse.json({ error: 'Missing idToken or partnerCode' }, { status: 400 });
    }

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
  }

  const result = await referralService.validatePartnerCode(code);
  return NextResponse.json(result);
}
