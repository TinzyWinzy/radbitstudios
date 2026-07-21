import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/api-auth';
import { withRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';
import { sendEmail } from '@/services/email-service';
import { z } from 'zod';

const ALLOWED_RECIPIENTS = new Set([
  'brandontinoz@gmail.com',
  'hanzohanic@gmail.com',
]);

const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(50000),
});

export const POST = withRateLimit(
  RateLimits.mutation,
  (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    return `ip:${ip}`;
  },
  async (req: NextRequest): Promise<NextResponse> => {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = SendEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { to, subject, html } = validation.data;

    if (!ALLOWED_RECIPIENTS.has(to)) {
      return NextResponse.json(
        { error: 'Recipient not allowed. Emails can only be sent to approved addresses.' },
        { status: 403 },
      );
    }

    await sendEmail(to, subject, html);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Email] Send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
},
);
