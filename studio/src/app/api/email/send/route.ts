import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { withRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Radbit SME Hub <hello@radbitstudios.co.zw>';

export const POST = withRateLimit(
  RateLimits.mutation,
  (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    return `ip:${ip}`;
  },
  async (req: NextRequest): Promise<NextResponse> => {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
  }

  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error: unknown) {
    console.error('[Email] Send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
},
);
