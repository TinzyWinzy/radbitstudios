import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { sendEmail } from '@/services/email-service';

function sendWelcomeEmail(email: string, name?: string, leadMagnet?: string) {
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const leadMagnetHtml = leadMagnet && LEAD_MAGNET_LINKS[leadMagnet]
    ? `<p style="color:#ccc;line-height:1.6;margin:0 0 16px">As promised, here is your free resource: <a href="${LEAD_MAGNET_LINKS[leadMagnet]}" style="color:#1A8A7A;text-decoration:underline"><strong>${leadMagnet}</strong></a></p>`
    : '';
  return sendEmail(
    email,
    'Welcome to Radbit — Your Zimbabwe Business Brief',
    `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0a0a0a;color:#e5e0d8;margin:0;padding:40px 20px"><div style="max-width:480px;margin:0 auto;background:#111;border-radius:12px;padding:32px;border:1px solid #333"><h1 style="color:#1A8A7A;margin:0 0 16px;font-size:20px">Welcome to Radbit</h1><p style="color:#ccc;line-height:1.6;margin:0 0 16px">${greeting}</p><p style="color:#ccc;line-height:1.6;margin:0 0 16px">You\'re subscribed to the Radbit newsletter. You\'ll receive Zimbabwe-focused business insights, tender opportunities, tax reminders, and diaspora investment news.</p>${leadMagnetHtml}<p style="color:#666;line-height:1.6;margin:0">If you ever need to adjust your preferences or unsubscribe, use the link at the bottom of any email.</p><div style="margin-top:32px;padding-top:16px;border-top:1px solid #333;text-align:center"><p style="color:#666;font-size:12px;margin:0">Radbit — AI tools for Zimbabwean enterprises</p><p style="color:#555;font-size:11px;margin:4px 0 0">Harare, Zimbabwe</p></div></div></body></html>`,
  );
}

const LEAD_MAGNET_LINKS: Record<string, string> = {
  'ZIMRA Tax Deadline Calendar for 2026': 'https://radbitstudios.co.zw/guides/zimra-tax-calendar-2026',
  'Diaspora Investment Checklist PDF': 'https://radbitstudios.co.zw/diaspora/invest',
};

const schema = z.object({
  email: z.string().email(),
  frequency: z.enum(['daily', 'weekly']).default('weekly'),
  name: z.string().optional(),
  leadMagnet: z.string().optional(),
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

    const { email, frequency, name, leadMagnet } = parsed.data;

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
      sendWelcomeEmail(email, name, leadMagnet).catch(() => {});
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

    sendWelcomeEmail(email, name, leadMagnet).catch(() => {});

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Newsletter Subscribe] Error:', message);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
