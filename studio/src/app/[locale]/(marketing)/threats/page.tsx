/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ChevronRight, Clock, Eye, Zap } from 'lucide-react';
import { adminDb } from '@/lib/firebase/firebase-admin';

export const metadata: Metadata = {
  title: 'Regulatory Threat Assessments | Radbit',
  description:
    'Real-time policy change monitoring for SADC businesses. Automated compliance alerts tracking PRAZ, ZIMRA, SADC, and regional regulatory updates.',
  alternates: { canonical: '/threats' },
};

interface ThreatDoc {
  id: string;
  triggerEvent: string;
  triggerSource: string;
  riskLevel: string;
  generatedAt: { toDate: () => Date } | Date;
  viewCount: number;
  holon?: {
    holon_type?: string;
    metadata?: { target_keyword?: string };
  };
}

const RISK_STYLES: Record<string, { border: string; badge: string; dot: string }> = {
  critical: { border: 'border-red-500/30', badge: 'bg-red-500/15 text-red-400', dot: 'bg-red-500' },
  high: { border: 'border-orange-500/30', badge: 'bg-orange-500/15 text-orange-400', dot: 'bg-orange-500' },
  medium: { border: 'border-yellow-500/30', badge: 'bg-yellow-500/15 text-yellow-400', dot: 'bg-yellow-500' },
  low: { border: 'border-green-500/30', badge: 'bg-green-500/15 text-green-400', dot: 'bg-green-500' },
};

export default async function ThreatsListPage() {
  let assessments: ThreatDoc[] = [];

  try {
    const snap = await adminDb
      .collection('threat_assessments')
      .where('published', '==', true)
      .orderBy('generatedAt', 'desc')
      .limit(50)
      .get();

    assessments = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ThreatDoc[];
  } catch {
    // Firestore unavailable
  }

  // Auto-seed initial threat assessments if empty
  if (assessments.length === 0) {
    try {
      const { initializeMonitorSources, checkForThreatEvents } = await import('@/services/reti-monitor');
      await initializeMonitorSources();
      await checkForThreatEvents();

      const retry = await adminDb
        .collection('threat_assessments')
        .where('published', '==', true)
        .orderBy('generatedAt', 'desc')
        .limit(50)
        .get();

      assessments = retry.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ThreatDoc[];
    } catch {
      // RETI seed failed, page will show empty state
    }
  }

  return (
    <div className="container py-12 md:py-24 space-y-10 max-w-5xl">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
          <Zap className="h-3 w-3" />
          Live Intelligence Feed
        </div>
        <h1 className="font-headline text-fluid-4xl font-bold tracking-tighter">
          Regulatory Threat <span className="text-gradient">Assessments</span>
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed">
          Radbit's monitoring system tracks PRAZ, SADC, ZIMRA, and other regional regulatory bodies for changes that
          affect your business. Each assessment shows what changed and what it means for you.
        </p>
        <p className="text-sm text-foreground/50 max-w-2xl leading-relaxed">
          Zimbabwe&apos;s regulatory landscape is dynamic. The Procurement Regulatory Authority of Zimbabwe (PRAZ) publishes revised procurement thresholds and procedures, ZIMRA updates tax administration guidelines quarterly, SADC issues trade protocols affecting cross-border goods, and line ministries release sector-specific policies with little advance notice. Radbit&apos;s RETI (Regulatory Early Threat Intelligence) engine monitors gazettes, official publications, and government portals around the clock &mdash; analysing each instrument for relevance to Zimbabwean SMEs and issuing a risk-rated assessment within hours of publication. Each entry below represents a detected regulatory event, with our analysis of its potential impact on your compliance obligations, tender eligibility, or operational requirements.
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto" />
          <p className="text-muted-foreground/60">
            No threat assessments yet. Radbit is monitoring policy channels and will publish alerts as regulatory
            changes are detected.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map(item => {
            const style = RISK_STYLES[item.riskLevel] || RISK_STYLES.medium;
            const date =
              item.generatedAt && typeof item.generatedAt === 'object' && 'toDate' in item.generatedAt
                ? item.generatedAt.toDate()
                : new Date(item.generatedAt as Date);

            return (
              <Link
                key={item.id}
                href={`/${item.holon?.holon_type === 'intercept_page' ? 'intelligence' : 'threats'}/${item.id}`}
                className={`group block p-5 rounded-xl border ${style.border} bg-card/30 hover:bg-muted/30 transition-all duration-200`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${style.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {item.riskLevel}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 font-mono">{item.triggerSource}</span>
                    </div>
                    <h3 className="font-headline font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.triggerEvent}
                    </h3>
                    {item.holon?.metadata?.target_keyword && (
                      <p className="text-xs text-muted-foreground/50 italic">
                        &ldquo;{item.holon.metadata.target_keyword}&rdquo;
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground/40">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {date.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {item.viewCount || 0} views
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
