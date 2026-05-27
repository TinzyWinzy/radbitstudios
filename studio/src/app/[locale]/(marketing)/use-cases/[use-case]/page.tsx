import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { useCases, useCaseHowToSchema, getPageUrl, type UseCasePage } from "@/data/seo-pages";
import { breadcrumbSchema } from "@/lib/seo";
import { AdBanner } from "@/components/ads/ad-banner";

export function generateStaticParams() {
  return useCases.map((p) => ({ 'use-case': p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { 'use-case': string };
}): Promise<Metadata> {
  const page = useCases.find((p) => p.slug === params['use-case']);
  if (!page) return { title: "Use Case Not Found" };

  return {
    title: page.title,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `/use-cases/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: getPageUrl('use-case', page.slug),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.metaDescription,
    },
  };
}

export const revalidate = 86400;

export default function UseCasePage({
  params,
}: {
  params: { 'use-case': string };
}) {
  const page = useCases.find((p) => p.slug === params['use-case']);
  if (!page) notFound();

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(useCaseHowToSchema(page)),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Use Cases", url: "/use-cases" },
            { name: page.h1, url: `/use-cases/${page.slug}` },
          ])),
        }}
      />

      {/* Hero */}
      <section className="container max-w-4xl py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
          <Zap className="h-3.5 w-3.5" />
          Use Case
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

      <AdBanner slot="usecase-hero" className="container max-w-4xl mb-16" />

      {/* How it works */}
      <section className="container max-w-4xl mb-20">
        <h2 className="font-headline text-2xl md:text-3xl font-bold mb-2">How It Works</h2>
        <p className="text-muted-foreground mb-8">Get started in minutes, not days.</p>
        <div className="space-y-6">
          {page.steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="flex-shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {i + 1}
              </div>
              <div>
                <h3 className="font-headline font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container max-w-4xl mb-20">
        <h2 className="font-headline text-2xl md:text-3xl font-bold mb-8">Why It Matters</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {page.benefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-4xl mb-20 text-center">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-12">
          <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">{page.cta}</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join thousands of Zimbabwean entrepreneurs using Radbit to grow their businesses.
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
