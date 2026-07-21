import { NextRequest, NextResponse } from 'next/server';
import { welcomeEmail, sendEmail } from '@/services/email-service';
import { z } from 'zod';

const WelcomeEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
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
    const { subject, html } = welcomeEmail(name);
    await sendEmail(email, subject, html);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Email] Welcome error:', error);
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}
