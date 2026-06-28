import { NextRequest, NextResponse } from 'next/server';
import { trackClick } from '@/services/attribution.service';

/**
 * Track a partner referral click (anonymous — no auth required).
 * Called via sendBeacon from useRefTracking hook.
 */
export async function POST(req: NextRequest) {
  try {
    const { refCode, landingPage, device } = await req.json();

    if (!refCode || typeof refCode !== 'string') {
      return NextResponse.json({ error: 'Missing refCode' }, { status: 400 });
    }

    const referralId = await trackClick(refCode, landingPage || '/', device);

    if (!referralId) {
      // Unknown partner code — still return 200 (don't leak info)
      return NextResponse.json({ tracked: false });
    }

    return NextResponse.json({ tracked: true, referralId });
  } catch (error: unknown) {
    // Silent failure — tracking is best-effort
    console.error('[Partner Track] Error:', error);
    return NextResponse.json({ tracked: false }, { status: 200 });
  }
}
