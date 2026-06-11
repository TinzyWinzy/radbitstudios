import type { Metadata } from 'next';
import { Shield, Globe, Lock, Zap, MapPin, Linkedin, Mail, Github, Twitter, Facebook, Phone } from 'lucide-react';
import { AdBanner } from "@/components/ads/ad-banner";

export const metadata: Metadata = {
  title: 'About — Radbit',
  description: 'Sovereign digital infrastructure for the African enterprise. Radbit delivers integrated intelligence, automation, and compliance tools purpose-built for Zimbabwean organisations.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Radbit',
    description: 'Sovereign digital infrastructure for the African enterprise.',
    type: 'website',
  },
};

export const revalidate = 3600;

const principles = [
  {
    icon: <Lock className="h-4 w-4" />,
    title: 'Digital Sovereignty',
    body: 'Zimbabwean data stays in Zimbabwean hands. Encrypted, stored in Southern Africa, governed by local law. Never shared, never sold.',
  },
  {
    icon: <Globe className="h-4 w-4" />,
    title: 'Built for Local Reality',
    body: 'Every feature accounts for multi-currency volatility, load-shedding, mobile money, and Zimbabwe-specific regulatory frameworks. No generic import.',
  },
  {
    icon: <Zap className="h-4 w-4" />,
    title: 'Enterprise-Grade, Accessible',
    body: 'The same compliance intelligence and AI infrastructure used by large organisations — delivered at a scale and price that meets enterprises where they are.',
  },
  {
    icon: <Shield className="h-4 w-4" />,
    title: 'Privacy by Design',
    body: 'We comply with the Zimbabwe Cyber and Data Protection Act, POPIA, and GDPR. Your operational data is yours alone.',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-24 space-y-16">
      <div className="space-y-4">
        <h1 className="font-headline text-fluid-4xl font-bold tracking-tighter">
          Rooted in Zimbabwe.
          <br />
          <span className="text-gradient">Building for Africa.</span>
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed">
          Radbit exists because African enterprises deserve digital infrastructure built for their reality — not repackaged from markets with stable grids, single currencies, and simple compliance.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Our Purpose</h2>
        <div className="space-y-4 text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          <p>
            Zimbabwean organisations operate in an environment of remarkable complexity: currency volatility that rewrites margins weekly, a regulatory surface area spanning PRAZ, ZIMRA, NSSA, RBZ, and the Labour Act, and infrastructure challenges that make cloud-dependent tools unreliable.
          </p>
          <p>
            Off-the-shelf software wasn&apos;t built for this. Radbit was.
          </p>
          <p>
            We combine digital assessment, tender intelligence, AI agent infrastructure, and a unified compliance command centre into a single sovereign platform. Every layer is designed for Zimbabwe&apos;s economic and regulatory reality — not adapted from a template built in another country.
          </p>
        </div>
      </section>

      <AdBanner slot="content-banner" />

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">What We Deliver</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: 'Enterprise Digital Assessment',
              body: 'Radar-chart analysis across finance, compliance, procurement, and technology — calibrated to Zimbabwean benchmarks. Five minutes to a prioritised roadmap.',
            },
            {
              title: 'Tender & Procurement Intelligence',
              body: 'AI-curated opportunities from 12+ government departments and 8 state enterprises. Real-time deadline tracking, PRAZ document management, and compliant submission workflows.',
            },
            {
              title: 'AI Agent Infrastructure',
              body: 'Deploy autonomous agents for financial projections, content production, customer operations, and compliance reporting — built for load-shedding resilience.',
            },
            {
              title: 'Regulatory Command Centre',
              body: 'ZIMRA tax copilot, PRAZ compliance manager, NSSA submissions, Labour Act policy generator, and export readiness coach — unified in one sovereign interface.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6 hover:border-primary/30 transition-colors"
            >
              <h3 className="font-headline font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-foreground/50 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Our Principles</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {principles.map((p) => (
            <div key={p.title} className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                {p.icon}
              </div>
              <h3 className="font-headline font-bold text-foreground">{p.title}</h3>
              <p className="text-sm text-foreground/50 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Who It Serves</h2>
        <p className="text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          Radbit serves enterprises across Zimbabwe — from manufacturing and financial services organisations in Harare and Bulawayo to agri-tech operations in Mashonaland and professional services firms across the country. If your organisation navigates Zimbabwe&apos;s regulatory and economic environment, Radbit is built for you.
        </p>
      </section>

      <section className="space-y-6 pt-8 border-t border-foreground/10">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Founded By</h2>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 text-2xl font-bold text-white">
            TT
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="font-headline font-bold text-foreground text-lg">Tinotenda Tagarira</h3>
              <p className="text-sm text-foreground/50">Founder &amp; Chief Executive Officer</p>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Tinotenda is a Zimbabwean software engineer and systems architect with deep experience building
              sovereign digital infrastructure for African markets. He founded Radbit to close the gap between
              what enterprise software promises and what Zimbabwean businesses actually need — platforms that
              account for multi-currency volatility, load-shedding resilience, mobile-money-first payments, and
              the full surface area of local regulation.
            </p>
            <div className="flex gap-4 pt-1">
              <a
                href="https://www.linkedin.com/in/tinotenda-tagarira-2aa7ab220/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
              <a
                href="https://github.com/tinzywinzy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary transition-colors"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-8 border-t border-foreground/10">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Contact &amp; Presence</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 text-sm text-foreground/60">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>9 Salcombe, Chadcomber<br />Harare, Zimbabwe</span>
          </div>
          <a href="tel:+263781334474" className="flex items-start gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
            <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>+263 78 133 4474</span>
          </a>
          <a href="mailto:hanzohanic@gmail.com" className="flex items-start gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
            <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>hanzohanic@gmail.com</span>
          </a>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/60">
          <a href="https://x.com/RadbitStudios" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Twitter className="h-4 w-4 text-primary shrink-0" />
            @RadbitStudios
          </a>
          <a href="https://facebook.com/RadbitStudioGlobal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Facebook className="h-4 w-4 text-primary shrink-0" />
            Radbit Studio Global
          </a>
          <a href="https://www.linkedin.com/company/radbitstudios" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Linkedin className="h-4 w-4 text-primary shrink-0" />
            linkedin.com/company/radbitstudios
          </a>
        </div>
      </section>
    </div>
  );
}
