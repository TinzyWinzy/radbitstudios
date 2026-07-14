import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ExternalLink,
  Globe2,
  Hotel,
  Layers3,
  Mail,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Portfolio | Radbit",
  description:
    "Selected websites and digital work by Radbit Studios, including City View Guest House, Wobic, Traamand, Unikvilla, Cultural Coder, and Nexus Agronomics.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio | Radbit",
    description:
      "Selected websites and digital work by Radbit Studios for Zimbabwean businesses.",
    type: "website",
    url: "/portfolio",
  },
};

const projects = [
  {
    name: "City View Guest House",
    domain: "cityviewguesthouse.co.zw",
    href: "https://cityviewguesthouse.co.zw",
    category: "Hospitality",
    summary:
      "A public-facing hospitality website built to help guests understand the offer, check the business quickly, and make contact without friction.",
    icon: Hotel,
    initials: "CV",
    palette: "from-emerald-500/25 via-teal-500/10 to-amber-400/20",
    services: ["Website", "Mobile layout", "Contact flow", "Local credibility"],
  },
  {
    name: "Wobic",
    domain: "wobic.co.zw",
    href: "https://wobic.co.zw",
    category: "Business Website",
    summary:
      "A clean web presence for a Zimbabwean business, focused on clarity, responsive browsing, and a more credible first impression.",
    icon: Building2,
    initials: "WB",
    palette: "from-sky-500/20 via-cyan-400/10 to-emerald-400/20",
    services: ["Website", "Responsive build", "Content structure", "SEO basics"],
  },
  {
    name: "Traamand",
    domain: "traamand.co.zw",
    href: "https://traamand.co.zw",
    category: "Corporate Web",
    summary:
      "A professional company website designed to make services easier to present, share, and verify with prospective clients.",
    icon: Layers3,
    initials: "TR",
    palette: "from-amber-500/20 via-orange-400/10 to-emerald-500/20",
    services: ["Company site", "Service pages", "Mobile layout", "Launch support"],
  },
  {
    name: "Unikvilla",
    domain: "unikvilla.co.zw",
    href: "https://unikvilla.co.zw",
    category: "Hospitality",
    summary:
      "A hospitality web presence shaped around trust, property presentation, and a simple path from browsing to enquiry.",
    icon: Hotel,
    initials: "UV",
    palette: "from-rose-500/20 via-amber-400/10 to-emerald-500/20",
    services: ["Hospitality site", "Mobile layout", "Booking enquiry flow", "Brand presentation"],
  },
  {
    name: "Cultural Coder",
    domain: "culturalcoder.co.zw",
    href: "https://culturalcoder.co.zw",
    category: "Technology",
    summary:
      "A technology brand site built to present software work, local context, and a clear professional identity.",
    icon: MonitorSmartphone,
    initials: "CC",
    palette: "from-violet-500/20 via-sky-400/10 to-emerald-500/20",
    services: ["Technology site", "Portfolio structure", "Responsive build", "Brand clarity"],
  },
  {
    name: "Nexus Agronomics",
    domain: "nexusagronomics.co.zw",
    href: "https://nexusagronomics.co.zw",
    category: "Agriculture",
    summary:
      "A sector-focused website for an agronomy business, designed to make services, credibility, and contact details easier to understand.",
    icon: Globe2,
    initials: "NA",
    palette: "from-lime-500/20 via-emerald-400/10 to-amber-500/20",
    services: ["Agriculture site", "Service structure", "Mobile layout", "Credibility content"],
  },
];

const capabilities = [
  {
    icon: MonitorSmartphone,
    title: "Responsive Builds",
    body: "Sites are designed for the way clients actually browse: phone first, fast to understand, and easy to contact from.",
  },
  {
    icon: Search,
    title: "Search Foundations",
    body: "Metadata, clean page structure, headings, and practical content formatting are handled from the first build.",
  },
  {
    icon: ShieldCheck,
    title: "Credibility Checks",
    body: "The goal is not decoration. A good site helps a buyer, guest, partner, or tender committee verify that the business is real.",
  },
];

export default function PortfolioPage() {
  return (
    <div className="container max-w-6xl py-10 md:py-16">
      <section className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end mb-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Selected work
          </span>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl">
            Websites that help clients trust the business faster.
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">
            Radbit Studios builds practical websites and business systems for local operators.
            The work below shows a simple standard: clear message, credible presentation,
            mobile-friendly pages, and a direct route for the next enquiry.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="mailto:hanzohanic@gmail.com?subject=Website%20Project%20Enquiry"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Discuss a Project
            </Link>
            <Link
              href="/pricing#web"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              View Web Packages
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-4">
            What prospective clients get
          </p>
          <div className="space-y-4">
            {[
              "A site that explains the business quickly",
              "Mobile pages that do not fight the reader",
              "A clear contact path for calls, email, or WhatsApp",
              "A foundation that can grow into booking, commerce, or dashboards",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3 mb-16">
        {projects.map((project) => {
          const Icon = project.icon;
          return (
            <article
              key={project.domain}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
            >
              <div className={`relative aspect-[16/10] bg-gradient-to-br ${project.palette}`}>
                <div className="absolute inset-x-5 top-5 rounded-t-lg border border-white/10 bg-background/80">
                  <div className="flex h-8 items-center gap-1.5 border-b border-border/60 px-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                    <span className="ml-2 truncate text-[10px] text-muted-foreground">
                      {project.domain}
                    </span>
                  </div>
                  <div className="grid h-28 place-items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <span className="font-headline text-lg font-bold">{project.initials}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-lg border border-white/10 bg-background/75 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">{project.category}</span>
                  </div>
                  <Globe2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-headline text-xl font-bold tracking-tight">
                      {project.name}
                    </h2>
                    <p className="mt-1 text-xs text-primary">{project.domain}</p>
                  </div>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.name}`}
                    className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {project.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-md border border-border/70 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mb-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-headline text-3xl font-bold tracking-tight">
            Built for the sales conversation after the click.
          </h2>
          <p className="mt-3 text-muted-foreground">
            A website should make the next conversation easier. Radbit focuses on the
            pages, proof, and contact paths that help a prospective client move from
            browsing to enquiry.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-border bg-card/60 p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-headline text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight">
              Need a site clients can take seriously?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Send the business name, what you sell, your current domain if you have one,
              and the action you want visitors to take. We will map the simplest build that
              gets you there.
            </p>
          </div>
          <Link
            href="mailto:hanzohanic@gmail.com?subject=Portfolio%20Website%20Enquiry"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start a Website
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
