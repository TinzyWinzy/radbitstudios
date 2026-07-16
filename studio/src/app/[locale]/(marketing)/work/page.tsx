import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Demonstrated Work — Radbit Studios | Systems & AI for African Business",
  description: "Selected projects built, deployed, and delivered by Radbit Studios. Honest status labels for every project.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Demonstrated Work — Radbit Studios",
    description: "Selected projects built, deployed, and delivered by Radbit Studios.",
    type: "website",
    url: "/work",
  },
};

const projects = [
  {
    name: "City View Guest House",
    domain: "cityviewguesthouse.co.zw",
    href: "https://cityviewguesthouse.co.zw",
    outcome: "Public-facing hospitality website with booking enquiry flow and mobile-first layout.",
    stacks: ["Next.js", "Tailwind", "Vercel"],
    status: "Live",
    desc: "A full website build for a Harare-based guest house. Mobile-first, contact-optimised, and designed to help guests check availability and make enquiries without friction.",
  },
  {
    name: "Wobic",
    domain: "wobic.co.zw",
    href: "https://wobic.co.zw",
    outcome: "Clean web presence for a Zimbabwean business with responsive design and SEO foundations.",
    stacks: ["Next.js", "Tailwind", "Vercel"],
    status: "Live",
    desc: "A professional company website built to make services easier to present, share, and verify with prospective clients.",
  },
  {
    name: "Traamand",
    domain: "traamand.co.zw",
    href: "https://traamand.co.zw",
    outcome: "Corporate website with clear service pages and mobile-optimised layout.",
    stacks: ["Next.js", "Tailwind", "Vercel"],
    status: "Live",
    desc: "A corporate web presence focused on clarity, responsive browsing, and a credible first impression.",
  },
  {
    name: "Unikvilla",
    domain: "unikvilla.co.zw",
    href: "https://unikvilla.co.zw",
    outcome: "Hospitality web presence with property presentation and booking enquiry flow.",
    stacks: ["Next.js", "Tailwind", "Vercel"],
    status: "Live",
    desc: "A hospitality website shaped around trust, property presentation, and a simple path from browsing to enquiry.",
  },
  {
    name: "Cultural Coder",
    domain: "culturalcoder.co.zw",
    href: "https://culturalcoder.co.zw",
    outcome: "Technology brand site presenting software work and local context.",
    stacks: ["Next.js", "Tailwind", "Vercel"],
    status: "Built + Deployed",
    desc: "A technology brand site built to present software work, local context, and a clear professional identity.",
  },
  {
    name: "Nexus Agronomics",
    domain: "nexusagronomics.co.zw",
    href: "https://nexusagronomics.co.zw",
    outcome: "Sector-focused agronomy website with service structure and credibility content.",
    stacks: ["Next.js", "Tailwind", "Firebase"],
    status: "Built + Deployed",
    desc: "An agri-tech business website designed to make services, credibility, and contact details easier to understand.",
  },
  {
    name: "Radbit Ops",
    domain: "radbitstudios.co.zw/pilot",
    href: "/pilot",
    outcome: "Compliance and tender-readiness tool for Zimbabwean SMEs. Currently in pilot.",
    stacks: ["Next.js", "Firebase", "Genkit", "Supabase"],
    status: "Built + Deployed (Pilot)",
    desc: "Internal product development. A working system that covers tender alerts, compliance deadlines, document storage, and ZIMRA workflow reminders. Improves weekly based on pilot user feedback.",
  },
];

const statusColors: Record<string, string> = {
  "Live": "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  "Built + Deployed": "border-blue-500/30 text-blue-400 bg-blue-500/10",
  "Built + Deployed (Pilot)": "border-amber-500/30 text-amber-400 bg-amber-500/10",
};

export default function WorkPage() {
  return (
    <div className="container max-w-6xl py-10 md:py-16">
      <section className="mb-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-5">
          <Sparkles className="h-3.5 w-3.5" />
          Demonstrated work
        </span>
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl">
          Projects we have built and deployed.
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">
          Every project on this page has an honest status label. We do not claim deployed systems that exist only in a design file.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.domain}
            className="group rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-headline font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                <a
                  href={project.href}
                  target={project.href.startsWith("http") ? "_blank" : undefined}
                  rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={`Open ${project.name}`}
                  className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <h2 className="font-headline text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                {project.name}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">{project.domain}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {project.desc}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.stacks.map((stack) => (
                  <span
                    key={stack}
                    className="rounded-md border border-border/70 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {stack}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight">
              Need a system built?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Tell us what you need and your budget range. We will reply within 48 hours with a diagnostic plan.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start a Project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
