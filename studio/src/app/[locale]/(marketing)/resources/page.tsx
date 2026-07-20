import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Calculator, ArrowRight, Wrench, HelpCircle, Sparkles, ArrowRightLeft, FileText, Building2, ReceiptText, Plane, Wallet, Zap, NotebookPen, Banknote, Shield } from "lucide-react";
import { AdBanner } from "@/components/ads/ad-banner";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { breadcrumbSchema } from "@/lib/seo";
import { DIAGNOSTIC_TOOLS } from "@/data/diagnostic-tools";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Business Resources — Guides, Tools & FAQs",
  description: "Guides on business registration, ZIMRA tax, SADC exports, and more. Plus VAT calculator, business name generator, and AI tools for Zimbabwean organisations.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Business Resources for Zimbabwean Organisations",
    description: "Guides, tools, and answers designed for the realities of running a business in Zimbabwe.",
    url: `${process.env.FRONTEND_URL || 'https://radbitstudios.co.zw'}/resources`,
  },
};

interface GuideItem {
  slug: string;
  title: string;
  excerpt: string;
  icon: string;
  readTime: string;
}

const GUIDE_ICONS: Record<string, LucideIcon> = {
  Building2,
  ReceiptText,
  Plane,
  Wallet,
  Zap,
  NotebookPen,
  FileText,
};

const tools = [
  ...DIAGNOSTIC_TOOLS.map(tool => ({ slug: tool.slug, title: tool.title, excerpt: tool.metaDescription, icon: <Calculator className="h-6 w-6" /> })),
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
  {
    slug: "currency-exchange",
    title: "Currency Exchange Rates",
    excerpt: "Live exchange rates for SADC currencies and major global pairs (USD, ZAR, JPY, EUR, GBP, and more).",
    icon: <ArrowRightLeft className="h-6 w-6" />,
  },
  {
    slug: "zig-faq",
    title: "ZiG Currency FAQ",
    excerpt: "Everything about the Zimbabwe Gold (ZiG) transition: tax compliance, PAYE tables, dual-currency accounting, and ZIMRA requirements.",
    icon: <Banknote className="h-6 w-6" />,
  },
  {
    slug: "fiscal-compliance",
    title: "Fiscal Device Compliance",
    excerpt: "ZIMRA fiscal device requirements explained: FDG API, VAT thresholds, penalties, and how to stay compliant without hardware.",
    icon: <ReceiptText className="h-6 w-6" />,
  },
  {
    slug: "zida-invest",
    title: "ZIDA Invest Guide",
    excerpt: "Zimbabwe Investment and Development Agency guide: investment pathways, key sectors, SEZ incentives, and how to invest with confidence.",
    icon: <Shield className="h-6 w-6" />,
  },
];

async function getGuides(): Promise<GuideItem[]> {
  try {
    const snap = await adminDb.collection("guides").where("published", "==", true).orderBy("createdAt", "desc").get();
    return snap.docs.map(d => {
      const data = d.data();
      return {
        slug: data.slug as string,
        title: data.title as string,
        excerpt: data.excerpt as string,
        icon: data.icon as string,
        readTime: data.readTime as string,
      };
    });
  } catch (error) {
    console.error('[Resources Page] Admin SDK failed to load guides — check IAM permissions or service account:', error);
    return [];
  }
}

function getIcon(name: string) {
  const Icon = GUIDE_ICONS[name] || GUIDE_ICONS.FileText;
  return <Icon className="h-6 w-6" />;
}

export default async function ResourcesPage() {
  const guides = await getGuides();
  const breadcrumbJson = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Resources", url: "/resources" },
  ]);

  return (
    <div className="container py-8 md:py-16 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
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
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          Knowledge for <span className="text-gradient">Zimbabwean Enterprises</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Free guides, tools, and answers designed for the realities of running a business in Zimbabwe.
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
        {guides.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-8 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Guides are being prepared. Check back soon.</p>
          </div>
        ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/resources/guides/${g.slug}`}
              className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {getIcon(g.icon || 'FileText')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {g.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    {g.readTime && <span className="text-xs text-muted-foreground">{g.readTime}</span>}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Read guide <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}
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
                and using Radbit.
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
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Get in Touch
        </Link>
      </div>
    </div>
  );
}
