import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  frequency: z.enum(['daily', 'weekly']).default('weekly'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, frequency, name } = parsed.data;

    const existing = await adminDb
      .collection('newsletter_subscribers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      if (doc.data().active) {
        return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
      }
      await doc.ref.update({ active: true, updatedAt: FieldValue.serverTimestamp() });
      return NextResponse.json({ message: 'Subscription reactivated' }, { status: 200 });
    }

    await adminDb.collection('newsletter_subscribers').add({
      email,
      name: name || '',
      frequency,
      subscribedAt: FieldValue.serverTimestamp(),
      active: true,
      source: 'website',
    });

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Newsletter Subscribe] Error:', message);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
