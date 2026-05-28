import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, path: pagePath, userId, timestamp, properties } = body;

    if (!event || !pagePath) {
      return NextResponse.json({ error: 'event and path required' }, { status: 400 });
    }

    // Store in Firestore analytics collection
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
  } catch (error) {
    console.error('[Analytics] Track error:', error);
    return NextResponse.json({ ok: true }); // Don't fail the client on analytics errors
  }
}
