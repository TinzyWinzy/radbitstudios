/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, ArrowRight, Globe, Shield, TrendingUp, Zap, Sun, Factory, Mountain, Leaf } from 'lucide-react';
import { ZIDA_SECTORS, ZIDA_INVESTMENT_PATHWAYS, ZIDA_KEY_FACTS } from '@/services/zida-knowledge';

export const metadata: Metadata = {
  title: 'ZIDA Invest — Zimbabwe Investment Guide for SMEs & Diaspora',
  description: 'Zimbabwe Investment and Development Agency (ZIDA) guide: investment pathways, key sectors (agriculture, mining, tourism, energy), SEZ incentives, and how Radbit helps you invest with confidence.',
  alternates: { canonical: '/resources/tools/zida-invest' },
  openGraph: {
    title: 'ZIDA Invest Guide — Zimbabwe Investment Opportunities',
    description: 'Complete guide to investing in Zimbabwe through ZIDA. Agriculture, mining, tourism, energy sectors. General Investment Licenses, PPPs, and SEZ incentives.',
  },
};

const sectorIcons: Record<string, typeof Leaf> = {
  agriculture: Leaf,
  mining: Mountain,
  tourism: Globe,
  energy: Zap,
  sez: Factory,
};

export default function ZidaInvestPage() {
  return (
    <div className="container max-w-4xl py-16">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
        &larr; Back to Resources
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">ZIDA Invest Guide</h1>
          <p className="text-muted-foreground">Zimbabwe Investment and Development Agency — investment pathways for diaspora & foreign investors</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-8 flex items-start gap-3">
        <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <strong>Q1 2026 Update:</strong> Zimbabwe lured <strong>US$1.4 billion</strong> in investment licences in Q1 2026 per ZIDA reports. Over <strong>US$39 billion</strong> in investment licences were issued in Q3 2025, a 21% jump from prior quarter.
        </div>
      </div>

      <section className="space-y-6 mb-10">
        <h2 className="font-headline text-xl font-bold">Investment Pathways</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ZIDA offers three routes for investing in Zimbabwe. Foreign investors can own up to 100% of their business through the General Investment License.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {ZIDA_INVESTMENT_PATHWAYS.map((pathway) => (
            <div key={pathway.type} className="rounded-xl border border-border/50 bg-card/30 p-4">
              <h3 className="font-headline font-semibold text-sm mb-1">{pathway.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{pathway.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-primary uppercase">Ownership: {pathway.ownership}</span>
                <a href={pathway.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Learn More <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 mb-10">
        <h2 className="font-headline text-xl font-bold">Key Sectors</h2>
        <div className="space-y-4">
          {ZIDA_SECTORS.map((sector) => {
            const Icon = sectorIcons[sector.id] || Sun;
            return (
              <details key={sector.id} className="group rounded-xl border border-border/50 bg-card/30 overflow-hidden">
                <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors list-none">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-semibold text-sm">{sector.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{Object.values(sector.stats).slice(0, 3).join(' • ')}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 pl-14 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{sector.description}</p>
                  <div>
                    <p className="text-xs font-semibold mb-1">Key Statistics:</p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(sector.stats).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-xs border-b border-border/20 py-0.5">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1">Investment Opportunities:</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                      {sector.opportunities.map((opp) => (
                        <li key={opp}>{opp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border/50 bg-card/30 p-6 space-y-4 mb-10">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-headline font-bold text-lg">How Radbit Connects You to ZIDA</h2>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Verified by Radbit:</strong> Diaspora investors can view verified operational snapshots of Zimbabwean SMEs before committing capital.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Investment Readiness:</strong> Our assessment tools help SMEs achieve the compliance and documentation standards ZIDA requires for foreign investment.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Cross-border Compliance:</strong> Track ZIMRA, NSSA, and PRAZ requirements alongside ZIDA investment licence conditions in one dashboard.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Direct Integration:</strong> Use the ZIDA DIY Investor Licensing Portal to apply for licences while Radbit handles your operational compliance.</span>
          </li>
        </ul>
      </section>

      <div className="rounded-xl border border-border/50 bg-muted/30 p-5 mb-8">
        <h3 className="font-headline font-semibold text-sm mb-3">ZIDA Quick Links</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a href={ZIDA_KEY_FACTS.diyPortal} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
            <ExternalLink size={10} /> DIY Investor Portal
          </a>
          <a href={ZIDA_KEY_FACTS.eregulations} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
            <ExternalLink size={10} /> eRegulations
          </a>
          <a href="https://zidainvest.com/public-private-partnerships/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
            <ExternalLink size={10} /> PPP Opportunities
          </a>
          <a href="https://drive.google.com/drive/folders/1a2E8IKrM4kgVDCMR3r6BG3S9VtEhx9BL" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
            <ExternalLink size={10} /> Quarterly Reports
          </a>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">Ready to explore investment opportunities in Zimbabwe?</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Get Investment Guidance
        </Link>
      </div>
    </div>
  );
}
