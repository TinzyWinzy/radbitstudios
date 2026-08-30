import { NextRequest, NextResponse } from 'next/server';
import { welcomeEmail, sendEmail } from '@/services/email-service';
import { adminAuth } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';
import { z } from 'zod';

const WelcomeEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
});

export const POST = withIpRateLimit(RateLimits.mutation, async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!idToken) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }

  let claims;
  try {
    claims = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = WelcomeEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, name } = validation.data;

    // Only allow sending a welcome email to the authenticated user's own address.
    if ((claims.email || '').toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match authenticated session' }, { status: 403 });
    }

    const { subject, html } = welcomeEmail(name);
    await sendEmail(email, subject, html);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Email] Welcome error:', error);
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
});