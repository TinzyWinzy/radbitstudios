import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { verifyNewsletterUnsubscribeToken } from '@/lib/newsletter-unsubscribe';

const schema = z.object({
  email: z.string().email(),
  token: z.string().length(64),
});

async function unsubscribe(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await adminDb
    .collection('newsletter_subscribers')
    .where('email', '==', normalizedEmail)
    .limit(1)
    .get();

  if (!existing.empty) {
    await existing.docs[0].ref.update({
      active: false,
      unsubscribedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') || '';
  const token = request.nextUrl.searchParams.get('token') || '';
  if (!verifyNewsletterUnsubscribeToken(email, token)) {
    return new NextResponse('Invalid or expired unsubscribe link.', { status: 400 });
  }
  await unsubscribe(email);
  return new NextResponse('You have been unsubscribed from Radbit marketing email.', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { email, token } = parsed.data;
    if (!verifyNewsletterUnsubscribeToken(email, token)) {
      return NextResponse.json({ error: 'Invalid unsubscribe token' }, { status: 403 });
    }
    await unsubscribe(email);
    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Newsletter Unsubscribe] Error:', message);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
