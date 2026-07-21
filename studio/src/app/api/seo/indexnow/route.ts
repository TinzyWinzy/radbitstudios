import { NextRequest, NextResponse } from 'next/server';
import { withIpRateLimit } from '@/services/api-rate-limit';

const BING_INDEXNOW_URL = 'https://www.bing.com/indexnow';
const INDEXNOW_KEY = process.env.BING_INDEXNOW_KEY || 'e9f0c9ea2f934beb84c222f903d1a419';
const SITE_HOST = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/^https?:\/\//, '').replace(/\/$/, '');

export const POST = withIpRateLimit(
  { windowMs: 60 * 60 * 1000, maxRequests: 20, keyPrefix: 'seo:indexnow' },
  async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const urlList = Array.isArray(body.urlList) ? body.urlList : [];

      const validUrls = urlList.filter((url: string) => typeof url === 'string' && url.startsWith(`https://${SITE_HOST}`));

      if (validUrls.length === 0) {
        return NextResponse.json({ error: 'No valid URLs provided' }, { status: 400 });
      }

      const payload = {
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${SITE_HOST}/BingSiteAuth.xml`,
        urlList: validUrls,
      };

      const res = await fetch(BING_INDEXNOW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (res.ok || res.status === 202) {
        return NextResponse.json({ success: true, status: res.status, response: text });
      }

      return NextResponse.json({ success: false, status: res.status, response: text }, { status: 502 });
    } catch (error) {
      console.error('[IndexNow] Error:', error instanceof Error ? error.message : error);
      return NextResponse.json({ error: 'IndexNow submission failed' }, { status: 500 });
    }
  },
);
