import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { validateBody, AnalyticsTrackSchema } from '@/lib/api-validation';

export async function POST(req: NextRequest) {
  try {
    const validation = await validateBody(req, AnalyticsTrackSchema);
    if (!validation.success) return validation.response;

    const { event, path: pagePath, userId, timestamp, properties } = validation.data;

    await adminDb.collection('analytics_events').add({
      event,
      path: pagePath,
      userId: userId || null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      properties: properties || {},
      userAgent: req.headers.get('user-agent') || null,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('[Analytics] Track error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: true });
  }
}
