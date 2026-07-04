/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ArrowRight, ExternalLink, AlertTriangle, Info, Banknote } from 'lucide-react';
import { getZiGFaq, getPayeTaxTablesUrl } from '@/services/zig-currency';

export const metadata: Metadata = {
  title: 'ZiG Currency FAQ — Zimbabwe Gold Transition Guide',
  description: 'Everything Zimbabwean businesses need to know about the ZiG (Zimbabwe Gold) currency transition: tax compliance, PAYE tables, dual-currency accounting, and ZIMRA requirements.',
  alternates: { canonical: '/resources/tools/zig-faq' },
  openGraph: {
    title: 'ZiG Currency FAQ — Zimbabwe Gold Transition Guide',
    description: 'Navigate Zimbabwe\'s currency transition with confidence. ZiG tax compliance, PAYE tables, and dual-currency accounting guidance.',
  },
};

export default function ZiGFaqPage() {
  const faq = getZiGFaq();
  const payeUrl = getPayeTaxTablesUrl();

  return (
    <div className="container max-w-3xl py-16">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
        &larr; Back to Resources
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Banknote className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">ZiG Currency FAQ</h1>
          <p className="text-muted-foreground">Zimbabwe Gold (ZiG) transition guide for businesses</p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Last updated:</strong> Based on ZIMRA Public Notices 28, 29, 31, 35 and the 2026 ZiG Transactions FAQs. Currency policies evolve rapidly &mdash; verify current rates with the RBZ and ZIMRA.
        </div>
      </div>

      <div className="space-y-4 mb-10">
        {faq.map((item, i) => (
          <details key={i} className="group rounded-xl border border-border/50 bg-card/30 overflow-hidden">
            <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors list-none">
              <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-headline font-semibold text-sm">{item.question}</h3>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-4 pb-4 pl-12 text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="font-headline font-bold text-lg">Key Resources</h2>
        </div>
        <ul className="space-y-3 text-sm">
          <li>
            <a href={payeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5" />
              Current ZiG PAYE Tax Tables (ZIMRA)
            </a>
            <p className="text-muted-foreground mt-1">Download the latest PAYE withholding tax tables. Ensure payroll uses the ZiG tables, not the old ZWL tables.</p>
          </li>
          <li>
            <a href="https://www.zimra.co.zw/news/public-notices" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5" />
              ZIMRA Public Notices (28, 29, 31, 35)
            </a>
            <p className="text-muted-foreground mt-1">Official guidance on ZiG transition for tax purposes, VAT filing in ZiG, and dual-currency compliance.</p>
          </li>
          <li>
            <Link href="/api/zig" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5" />
              Radbit ZiG API
            </Link>
            <p className="text-muted-foreground mt-1">Programmatic access to current ZiG rates and tax obligation conversion for your applications.</p>
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">Need personalised guidance on ZiG tax compliance?</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Talk to an Advisor
        </Link>
      </div>
    </div>
  );
}
