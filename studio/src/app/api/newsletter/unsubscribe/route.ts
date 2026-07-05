import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { email } = parsed.data;
    const existing = await adminDb
      .collection('newsletter_subscribers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (existing.empty) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    await existing.docs[0].ref.update({ active: false, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Newsletter Unsubscribe] Error:', message);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
