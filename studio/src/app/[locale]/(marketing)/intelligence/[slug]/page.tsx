import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ThreatAssessmentHolon } from '@/components/threat-assessment-holon';
import { adminDb } from '@/lib/firebase/firebase-admin';

interface Props {
  params: { slug: string };
}

async function getInterceptPage(slug: string) {
  try {
    const doc = await adminDb.collection('threat_assessments').doc(slug).get();
    if (!doc.exists) return null;

    const data = doc.data()!;
    const holon = data.holon as { holon_type?: string } | undefined;

    if (holon?.holon_type !== 'intercept_page') return null;

    await adminDb.collection('threat_assessments').doc(slug).update({
      viewCount: (data.viewCount || 0) + 1,
    });

    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getInterceptPage(params.slug);
  if (!data) return { title: 'Intelligence Brief Not Found' };

  const holon = data.holon as {
    metadata?: { target_keyword?: string; search_intent?: string; risk_level?: string };
    hero_section?: { h1_headline?: string; sub_headline?: string };
  };

  return {
    title: `${holon?.hero_section?.h1_headline || 'Operational Intelligence'} | Radbit`,
    description: holon?.hero_section?.sub_headline || 'Sector intelligence for SADC businesses.',
    alternates: { canonical: `/intelligence/${params.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function IntelligencePage({ params }: Props) {
  const data = await getInterceptPage(params.slug);

  if (!data) {
    notFound();
  }

  const holon = data.holon as Parameters<typeof ThreatAssessmentHolon>[0]['holon'];

  return <ThreatAssessmentHolon holon={holon} />;
}
