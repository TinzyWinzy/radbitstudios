import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { affiliateLinks, getAffiliateUrl } from '@/lib/affiliate-links';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug: slugParts } = await params;
  const slug = slugParts?.join('/');

  if (!slug || !(slug in affiliateLinks)) {
    return NextResponse.redirect(new URL('/404', _req.url), 308);
  }

  const link = affiliateLinks[slug as keyof typeof affiliateLinks];
  const targetUrl = getAffiliateUrl(slug as keyof typeof affiliateLinks);

  void logClick(slug, link, _req);

  return NextResponse.redirect(targetUrl, 302);
}

async function logClick(
  slug: string,
  link: { program: string | null; title: string },
  req: NextRequest,
) {
  try {
    const ua = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';

    await adminDb.collection('affiliate_clicks').add({
      slug,
      program: link.program,
      title: link.title,
      userAgent: ua.slice(0, 500),
      referer: referer.slice(0, 1000),
      ip: ip.slice(0, 45),
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Logging failure is non-critical — don't break the redirect
  }
}
