import type { Metadata } from 'next';
import { Shield, MapPin, Mail, Phone, Linkedin, Target, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Radbit Studios | Systems & AI for African Business',
  description: 'Radbit Studios is a systems architecture and AI-integration practice. We build cloud infrastructure, automate compliance workflows, and design software systems.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About — Radbit Studios',
    description: 'Systems architecture and AI-integration practice for African businesses.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-24 space-y-16 max-w-5xl">
      <div className="space-y-4">
        <h1 className="font-headline text-fluid-4xl font-bold tracking-tighter">
          About <span className="text-gradient">Radbit Studios</span>
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed">
          We build cloud infrastructure, AI-assisted workflows, and compliance systems for African businesses and their international partners.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Why Radbit Studios exists</h2>
        <div className="space-y-4 text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          <p>
            Radbit Studios was founded to solve the gap between technical capability and local business infrastructure. Off-the-shelf software was designed for stable economies with predictable regulation. That is not the SADC reality.
          </p>
          <p>
            We build systems that work in the environments our clients actually operate in. Whether it is cloud infrastructure for a fintech startup, a RAG pipeline for document-heavy compliance work, or an internal tool that replaces spreadsheets and WhatsApp threads.
          </p>
          <p>
            Radbit Studios operates alongside Nexus Agronomics, an agri-tech venture focused on data-driven farming solutions for smallholder cooperatives.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="font-headline font-bold text-foreground">What we value</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              { title: "Ownership", body: "We own the outcome, not just the deliverable." },
              { title: "Precision", body: "We say what we will build and build what we said." },
              { title: "Honest proof", body: "We only claim what is independently verifiable." },
              { title: "Local capability", body: "Built in Zimbabwe, for local and international markets." },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-2">
                <BadgeCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div><strong className="text-foreground">{item.title}:</strong> {item.body}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="font-headline font-bold text-foreground">Founder</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Tinotenda Brandon Duma</strong> &mdash; Engineer and systems architect.</p>
            <p>Full-stack product engineer combining software implementation, applied AI, product thinking and direct stakeholder delivery.</p>
            <ul className="space-y-1">
              <li className="flex items-start gap-2"><BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> BSc Applied Computer Technology, USIU–Africa</li>
              <li className="flex items-start gap-2"><BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> Public project evidence with explicit proof states</li>
            </ul>
            <Link href="/founders" className="text-primary hover:underline text-xs font-medium inline-block mt-1">
              Full bio and background &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-8 border-t border-foreground/10">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Contact</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 text-sm text-foreground/60">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Harare, Zimbabwe</span>
          </div>
          <a href="tel:+263781334474" className="flex items-start gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
            <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>+263 78 133 4474</span>
          </a>
          <a href="mailto:hello@radbitstudios.co.zw" className="flex items-start gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
            <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>hello@radbitstudios.co.zw</span>
          </a>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/60">
          <a href="https://www.linkedin.com/company/radbitstudios" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Linkedin className="h-4 w-4 text-primary shrink-0" />
            linkedin.com/company/radbitstudios
          </a>
        </div>
      </section>
    </div>
  );
}
