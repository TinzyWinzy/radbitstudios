import { NextRequest, NextResponse } from 'next/server';
import { generateThreatAssessment, ThreatAssessmentInputSchema } from '@/ai/flows/generate-threat-assessment';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { withIpRateLimit } from '@/services/api-rate-limit';
import { RateLimits } from '@/services/rate-limiter';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);
}

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) return false;
  return true;
}

export const POST = withIpRateLimit(RateLimits.mutation, async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = ThreatAssessmentInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await generateThreatAssessment(parsed.data);
    const slug = slugify(parsed.data.triggerTitle);

    const doc = {
      holon: result.holon,
      triggerEvent: parsed.data.triggerTitle,
      triggerSource: parsed.data.triggerSource,
      triggerDate: parsed.data.triggerDate,
      riskLevel: result.holon.metadata.risk_level,
      generatedAt: new Date(),
      slug,
      published: true,
      viewCount: 0,
    };

    await adminDb.collection('threat_assessments').doc(slug).set(doc, { merge: true });

    const isIntercept = result.holon.holon_type === 'intercept_page';

    return NextResponse.json({
      slug,
      holon: result.holon,
      url: `/${isIntercept ? 'intelligence' : 'threats'}/${slug}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate threat assessment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const GET = withIpRateLimit(RateLimits.apiDefault, async () => {
  try {
    const snap = await adminDb.collection('threat_assessments')
      .where('published', '==', true)
      .orderBy('generatedAt', 'desc')
      .limit(20)
      .get();

    const assessments = snap.docs.map(doc => ({
      id: doc.id,
      slug: doc.id,
      triggerEvent: doc.data().triggerEvent,
      triggerSource: doc.data().triggerSource,
      riskLevel: doc.data().riskLevel,
      generatedAt: doc.data().generatedAt,
      viewCount: doc.data().viewCount || 0,
    }));

    return NextResponse.json({ assessments });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list assessments';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});