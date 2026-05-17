import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, Lightbulb, Wrench, FileText, HelpCircle, CheckCircle, Sparkles } from "lucide-react";
import { headers } from "next/headers";
import { getMessages } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages();
  const t = (key: string) => (messages as any)["resources"]?.[key] || key;
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function ResourcesPage() {
  const guides = [
    {
      slug: "register-business-zimbabwe",
      title: "How to Register a Business in Zimbabwe (2026)",
      excerpt: "Step-by-step guide to PACRA/ZIMRA registration, from company name search to tax clearance. Everything you need to know as a Zimbabwean SME.",
      icon: <FileText className="h-6 w-6" />,
      tags: ["Registration", "Compliance", "PACRA", "ZIMRA"],
      readTime: "15 min read",
    },
    {
      slug: "zimra-tax-guide-smes",
      title: "ZIMRA Tax Guide for SMEs — QPD, VAT & Paye Explained",
      excerpt: "A plain-English breakdown of Zimbabwe's tax obligations: when to register, what to pay, how to file, and how Radbit automates it.",
      icon: <BookOpen className="h-6 w-6" />,
      tags: ["Tax", "ZIMRA", "Accounting"],
      readTime: "18 min read",
    },
    {
      slug: "sadc-export-guide",
      title: "SADC Export Guide for Zimbabwean SMEs",
      excerpt: "How to tap into regional markets. Covers SADC trade protocols, customs documentation, and the most accessible export opportunities.",
      icon: <Lightbulb className="h-6 w-6" />,
      tags: ["Export", "SADC", "Trade"],
      readTime: "14 min read",
    },
    {
      slug: "ecocash-business-vs-personal",
      title: "EcoCash Business vs Personal — Which Should You Use?",
      excerpt: "A practical comparison of EcoCash merchant accounts versus personal wallets for SME transactions, including limits and fees.",
      icon: <Wrench className="h-6 w-6" />,
      tags: ["Payments", "EcoCash", "Mobile Money"],
      readTime: "8 min read",
    },
    {
      slug: "load-shedding-solutions-smes",
      title: "Load-Shedding Solutions That Actually Work for SMEs",
      excerpt: "Solar, inverters, generators — a cost-benefit breakdown so you can choose the right backup power solution for your business.",
      icon: <Sparkles className="h-6 w-6" />,
      tags: ["Infrastructure", "Energy", "Cost"],
      readTime: "12 min read",
    },
  ];

  const tools = [
    {
      slug: "vat-calculator",
      title: "VAT Calculator Zimbabwe",
      excerpt: "Calculate VAT-inclusive and VAT-exclusive prices for any transaction using the current ZIMRA 15% rate.",
      icon: <Calculator className="h-6 w-6" />,
    },
    {
      slug: "business-name-generator",
      title: "Business Name Generator",
      excerpt: "Get Shona, English, and bilingual business name suggestions tailored to your industry and values.",
      icon: <Wrench className="h-6 w-6" />,
    },
  ];

  return (
    <div className="container py-16 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Resources</span>
      </nav>

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
          <BookOpen className="h-3.5 w-3.5" />
          Resources
        </span>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Knowledge for Zimbabwean SMEs
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Free guides, tools, and answers designed for the realities of running a business in Zimbabwe.
          No jargon, no fluff — just what you need to move forward.
        </p>
      </div>

      {/* Pillar Guides */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="font-headline text-2xl font-bold">Pillar Guides</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">2,000+ words each</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/resources/guides/${guide.slug}`}
              className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {guide.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {guide.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Read guide <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Interactive Tools */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="h-5 w-5 text-primary" />
          <h2 className="font-headline text-2xl font-bold">Free Tools</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/resources/tools/${tool.slug}`}
              className="group rounded-xl border border-dashed border-border/50 bg-card/30 p-6 hover:border-primary/40 hover:bg-card/60 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 size-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{tool.excerpt}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="mb-8">
        <div className="rounded-xl border border-border/50 bg-card/50 p-8">
          <div className="flex items-start gap-4">
            <HelpCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="font-headline text-xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mb-4">
                Got questions? Our FAQ covers the most common questions about registering, taxes, payments,
                and using Radbit SME Hub.
              </p>
              <Link
                href="/resources/faq"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                View all questions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground mb-4">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <Link
          href="/mentor"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Ask the AI Mentor
        </Link>
      </div>
    </div>
  );
}
