import { NextResponse } from 'next/server';
import { getSubscribersForDigest, generateDigestForUser, markDigestSent } from '@/services/newsletter-service';
import { sendEmail } from '@/services/email-service';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

function buildNewsletterHtml(title: string, body: string, link?: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0a0a0a;color:#e5e0d8;margin:0;padding:40px 20px"><div style="max-width:600px;margin:0 auto;background:#111;border-radius:12px;padding:32px;border:1px solid #333"><h1 style="color:#1A8A7A;margin:0 0 16px;font-size:22px">${title}</h1><div style="color:#ccc;line-height:1.7;white-space:pre-wrap">${body.replace(/\n/g, '<br>')}</div>${link ? `<p style="margin-top:24px"><a href="${link}" style="display:inline-block;background:#1A8A7A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View on Radbit</a></p>` : ''}<div style="margin-top:32px;padding-top:16px;border-top:1px solid #333;text-align:center"><p style="color:#666;font-size:12px;margin:0">Radbit — AI tools for Zimbabwean enterprises</p><p style="color:#555;font-size:11px;margin:4px 0 0">Harare, Zimbabwe</p></div></div></body></html>`;
}

async function generateAndSendDigest(sub: Awaited<ReturnType<typeof getSubscribersForDigest>>[number]): Promise<boolean> {
  try {
    const digest = await generateDigestForUser(sub.userId, true);

    const bodyParts: string[] = [];

    if (digest.topStories.length > 0) {
      bodyParts.push('Top Stories:');
      digest.topStories.slice(0, 5).forEach(s => {
        bodyParts.push(`• ${s.headline}`);
        if (s.summary) bodyParts.push(`  ${s.summary.slice(0, 200)}`);
      });
      bodyParts.push('');
    }

    if (digest.relevantTenders.length > 0) {
      bodyParts.push('Tender Opportunities:');
      digest.relevantTenders.slice(0, 5).forEach(t => {
        bodyParts.push(`• ${t.title}`);
        bodyParts.push(`  ${t.org} | ${t.value} | Deadline: ${t.deadline}`);
      });
      bodyParts.push('');
    }

    if (digest.industryInsight) {
      bodyParts.push('Market Insight:');
      bodyParts.push(digest.industryInsight);
      bodyParts.push('');
    }

    if (digest.upcomingDeadlines.length > 0) {
      bodyParts.push('⚠️ Upcoming Deadlines:');
      digest.upcomingDeadlines.slice(0, 5).forEach(d => {
        bodyParts.push(`• ${d.tender} — ${d.daysLeft} day${d.daysLeft === 1 ? '' : 's'} left (${d.deadline})`);
      });
      bodyParts.push('');
    }

    const emailBody = bodyParts.join('\n');
    const emailHtml = buildNewsletterHtml(
      `Radbit Digest — ${new Date().toLocaleDateString('en-ZW', { weekday: 'long', day: 'numeric', month: 'short' })}`,
      emailBody,
      '/dashboard',
    );

    await sendEmail(sub.email, `Radbit Digest — Your Business Brief`, emailHtml);
    await markDigestSent(sub.userId);

    await adminDb.collection('newsletter_subscriptions').doc(sub.userId).update({
      lastSentAt: FieldValue.serverTimestamp(),
    });

    return true;
  } catch (err) {
    console.error(`[NewsletterDispatch] Failed for ${sub.userId}:`, err);
    return false;
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const frequency = url.searchParams.get('frequency') === 'weekly' ? 'weekly' : 'daily';

    const subscribers = await getSubscribersForDigest(frequency);
    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      const ok = await generateAndSendDigest(sub);
      if (ok) sent++;
      else failed++;
    }

    return NextResponse.json({
      frequency,
      subscribers: subscribers.length,
      sent,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
