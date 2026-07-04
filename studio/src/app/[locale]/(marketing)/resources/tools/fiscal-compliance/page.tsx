/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowRight, ExternalLink, AlertTriangle, CheckCircle, FileText, Receipt, Download } from 'lucide-react';
import { getFiscalThresholds, getFiscalComplianceGuide } from '@/services/zimra-fiscal';

export const metadata: Metadata = {
  title: 'ZIMRA Fiscal Device Compliance — Guide for Zimbabwe Businesses',
  description: 'Everything you need to know about ZIMRA fiscal device requirements: FDG API integration, VAT registration thresholds, penalties, and compliance automation.',
  alternates: { canonical: '/resources/tools/fiscal-compliance' },
  openGraph: {
    title: 'ZIMRA Fiscal Device Compliance Guide',
    description: 'Mandatory fiscalisation for Zimbabwe VAT-registered businesses. FDG API integration, compliance thresholds, and automation with Radbit.',
  },
};

export default function FiscalCompliancePage() {
  const thresholds = getFiscalThresholds();
  const guide = getFiscalComplianceGuide();

  return (
    <div className="container max-w-3xl py-16">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
        &larr; Back to Resources
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Receipt className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Fiscal Device Compliance</h1>
          <p className="text-muted-foreground">ZIMRA Fiscal Device Gateway &mdash; your legal obligation explained</p>
        </div>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-950/20 p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div className="text-sm text-red-800 dark:text-red-200">
          <strong>Legal Requirement:</strong> Every VAT-registered business in Zimbabwe MUST use a ZIMRA-approved fiscal device or FDG-compliant software. Non-compliance carries penalties of up to <strong>30% of the tax due</strong> plus interest.
        </div>
      </div>

      <section className="space-y-6 mb-10">
        <h2 className="font-headline text-xl font-bold">What Is Fiscalisation?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Fiscalisation is the process of recording every business transaction through ZIMRA-approved systems to ensure tax compliance. ZIMRA&apos;s Fiscal Device Gateway (FDG) API allows software-based fiscalisation without requiring physical hardware &mdash; a game-changer for digital businesses.
        </p>

        <div className="rounded-xl border border-border/50 bg-card/30 p-4 md:p-6">
          <h3 className="font-headline font-semibold text-sm mb-3">VAT Registration Thresholds</h3>
          <div className="space-y-2 text-sm">
            {thresholds.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <span className="text-muted-foreground">{t.category}</span>
                <span className="font-medium">{t.threshold}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6 mb-10">
        <h2 className="font-headline text-xl font-bold">Compliance Guide</h2>
        <ol className="space-y-4">
          {guide.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {i + 1}
              </div>
              <div>
                <h3 className="font-headline font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-border/50 bg-card/30 p-6 space-y-4 mb-10">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h2 className="font-headline font-bold text-lg">How Radbit Helps</h2>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>FDG API Integration:</strong> Submit receipts and invoices directly to ZIMRA through our software-based fiscalisation &mdash; no hardware required.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Automatic Compliance Monitoring:</strong> Track your fiscal device status, certificate expiry, and submission history in real time.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Threshold Alerts:</strong> Get notified when your turnover approaches VAT registration thresholds so you&apos;re never caught offside.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Offline Mode:</strong> Continue issuing receipts even without internet &mdash; sync automatically when connectivity returns.</span>
          </li>
        </ul>
      </section>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">Need help with fiscal device compliance?</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Get Compliant Today
        </Link>
      </div>
    </div>
  );
}
