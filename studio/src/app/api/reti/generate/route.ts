import { NextRequest, NextResponse } from 'next/server';
import { generateThreatAssessment, ThreatAssessmentInputSchema } from '@/ai/flows/generate-threat-assessment';
import { adminDb } from '@/lib/firebase/firebase-admin';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
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
}

export async function GET() {
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
}
