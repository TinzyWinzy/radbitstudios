import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Building2, Wrench, AlertTriangle } from "lucide-react";
import { industries, industryServiceSchema, getPageUrl, type IndustryPage } from "@/data/seo-pages";
import { breadcrumbSchema } from "@/lib/seo";
import { AdBanner } from "@/components/ads/ad-banner";

export function generateStaticParams() {
  return industries.map((p) => ({ industry: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { industry: string };
}): Promise<Metadata> {
  const page = industries.find((p) => p.slug === params.industry);
  if (!page) return { title: "Industry Not Found" };

  return {
    title: page.title,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `/solutions/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: getPageUrl('industry', page.slug),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.metaDescription,
    },
  };
}

export const revalidate = 86400; // Revalidate daily

export default function IndustryPage({
  params,
}: {
  params: { industry: string };
}) {
  const page = industries.find((p) => p.slug === params.industry);
  if (!page) notFound();

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(industryServiceSchema(page)),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Solutions", url: "/solutions" },
            { name: page.h1, url: `/solutions/${page.slug}` },
          ])),
        }}
      />

      {/* Hero */}
      <section className="container max-w-4xl py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
          <Building2 className="h-3.5 w-3.5" />
          Industry Solution
        </div>
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          {page.h1}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
          {page.intro}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border font-medium hover:bg-muted transition-colors"
          >
            Take the Assessment
          </Link>
        </div>
      </section>

      <AdBanner slot="industry-hero" className="container max-w-4xl mb-16" />

      {/* Problems */}
      <section className="container max-w-4xl mb-20">
        <h2 className="font-headline text-2xl md:text-3xl font-bold mb-2">The Challenges</h2>
        <p className="text-muted-foreground mb-8">Common pain points for {page.slug.replace(/-/g, ' ')} businesses in Zimbabwe.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {page.problems.map((problem, i) => (
            <div key={i} className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-headline font-semibold mb-1">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions */}
      <section className="container max-w-4xl mb-20">
        <h2 className="font-headline text-2xl md:text-3xl font-bold mb-2">How Radbit Helps</h2>
        <p className="text-muted-foreground mb-8">Purpose-built tools for your industry.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {page.solutions.map((solution, i) => (
            <div key={i} className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-headline font-semibold mb-1">{solution.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{solution.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container max-w-4xl mb-20">
        <h2 className="font-headline text-2xl md:text-3xl font-bold mb-8">Key Features</h2>
        <div className="flex flex-wrap gap-3">
          {page.features.map((feature, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium"
            >
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {feature}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-4xl mb-20 text-center">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-12">
          <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">{page.cta}</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join thousands of Zimbabwean businesses using Radbit to digitize operations, win tenders, and grow.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Sign Up Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
