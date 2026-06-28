import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { partnerService } from '@/services/partner.service';
import { generatePartnerPitch } from '@/ai/flows/generate-partner-pitch';

export const POST = withIpRateLimit(
  { maxRequests: 20, windowMs: 60 * 1000, keyPrefix: 'ratelimit:partner-copilot' },
  async (req: NextRequest) => {
    try {
      const { idToken, businessType, description, name, location } = await req.json();

      if (!idToken) {
        return NextResponse.json({ error: 'Missing idToken' }, { status: 401 });
      }
      if (!businessType || !description) {
        return NextResponse.json({ error: 'businessType and description are required' }, { status: 400 });
      }

      const decoded = await getAuth(adminApp).verifyIdToken(idToken);
      const partner = await partnerService.getByUid(decoded.uid);
      if (!partner) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }
      if (partner.status !== 'active') {
        return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
      }

      const result = await generatePartnerPitch({ businessType, description, name, location });

      return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);
