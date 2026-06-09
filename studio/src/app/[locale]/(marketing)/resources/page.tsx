import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Calculator, ArrowRight, Wrench, HelpCircle, Sparkles, FileText } from "lucide-react";
import { AdBanner } from "@/components/ads/ad-banner";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Free Business Resources for Zimbabwean SMEs — Guides, Tools & FAQs",
  description: "Free guides on registering a business, ZIMRA tax, SADC exports, and more. Plus VAT calculator, business name generator, and AI tools for Zimbabwean entrepreneurs.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Free Business Resources for Zimbabwean SMEs",
    description: "Free guides, tools, and answers designed for the realities of running a business in Zimbabwe.",
    url: `${process.env.FRONTEND_URL || 'https://radbitstudios.co.zw'}/resources`,
  },
};

const guides = [
  {
    slug: "register-business-zimbabwe",
    title: "Registering a Business in Zimbabwe",
    excerpt: "A complete walkthrough of the company registration process — Deeds Office, PRAZ, ZIMRA, and local council licenses with actual costs and timelines.",
    icon: <FileText className="h-6 w-6" />,
    readTime: "15 min read",
  },
  {
    slug: "zimra-tax-guide-smes",
    title: "Tax in Zimbabwe for SMEs",
    excerpt: "Everything you need to know about ZIMRA — taxes, filing deadlines, and common pitfalls every Zimbabwean SME owner should know.",
    icon: <FileText className="h-6 w-6" />,
    readTime: "15 min read",
  },
  {
    slug: "ecocash-business-vs-personal",
    title: "EcoCash Business vs Personal",
    excerpt: "What the EcoCash Business upgrade actually changes — transaction limits, fees, compliance, and whether it's worth it for your SME.",
    icon: <FileText className="h-6 w-6" />,
    readTime: "10 min read",
  },
  {
    slug: "sadc-export-guide",
    title: "Exporting from Zimbabwe to SADC",
    excerpt: "A practical walkthrough of exporting goods from Zimbabwe to SADC countries — documentation, duties, transport corridors, and common mistakes.",
    icon: <FileText className="h-6 w-6" />,
    readTime: "20 min read",
  },
  {
    slug: "load-shedding-solutions-smes",
    title: "Load-Shedding Solutions for SMEs",
    excerpt: "Practical ways to keep your business running during power outages — from basic inverter setups to solar options without breaking the bank.",
    icon: <FileText className="h-6 w-6" />,
    readTime: "12 min read",
  },
  {
    slug: "zim-business-planning",
    title: "Business Planning in Zimbabwe",
    excerpt: "How to build a business plan that works in Zimbabwe's unique economy — practical templates and local market insights.",
    icon: <FileText className="h-6 w-6" />,
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

export default function ResourcesPage() {
  return (
    <div className="container py-8 md:py-16 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Resources</span>
      </nav>

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-16">
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

      <AdBanner slot="content-banner" className="mb-12" />

      {/* Pillar Guides */}
      <section className="mb-10 md:mb-20 content-visibility-auto">
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
      <section className="mb-10 md:mb-20 content-visibility-auto">
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
      <section className="mb-8 content-visibility-auto">
        <div className="rounded-xl border border-border/50 bg-card/50 p-4 md:p-8">
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
      <div className="mt-8 md:mt-16 text-center">
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
