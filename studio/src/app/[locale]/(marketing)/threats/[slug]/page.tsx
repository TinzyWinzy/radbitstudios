import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ThreatAssessmentHolon } from '@/components/threat-assessment-holon';
import { adminDb } from '@/lib/firebase/firebase-admin';

interface Props {
  params: { slug: string };
}

async function getAssessment(slug: string) {
  try {
    const doc = await adminDb.collection('threat_assessments').doc(slug).get();
    if (!doc.exists) return null;

    const data = doc.data()!;

    await adminDb.collection('threat_assessments').doc(slug).update({
      viewCount: (data.viewCount || 0) + 1,
    });

    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getAssessment(params.slug);
  if (!data) return { title: 'Threat Assessment Not Found' };

  const holon = data.holon as {
    metadata?: { target_keyword?: string; trigger_event?: string; risk_level?: string };
    hero_section?: { h1_headline?: string; sub_headline?: string };
  };

  return {
    title: `${holon?.hero_section?.h1_headline || 'Regulatory Threat Assessment'} | Radbit`,
    description: holon?.hero_section?.sub_headline || 'Automated compliance threat assessment for SADC enterprises.',
    alternates: { canonical: `/threats/${params.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function ThreatAssessmentPage({ params }: Props) {
  const data = await getAssessment(params.slug);

  if (!data) {
    notFound();
  }

  const holon = data.holon as Parameters<typeof ThreatAssessmentHolon>[0]['holon'];

  return <ThreatAssessmentHolon holon={holon} />;
}
