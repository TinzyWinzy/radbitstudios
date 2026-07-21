import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MapPin, Briefcase, Shield, Globe } from "lucide-react";
import { ALL_SADC, getCountryBySlug, DIASPORA_HUBS } from "@/data/sadc-countries";
import { breadcrumbSchema } from "@/lib/seo";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

export function generateStaticParams() {
  return ALL_SADC.map(c => ({ country: c.slug }));
}

export function generateMetadata({ params }: { params: { country: string } }): Metadata {
  const country = getCountryBySlug(params.country);
  if (!country) return { title: "Country not found" };
  const relatedHub = DIASPORA_HUBS.find(h => h.slug === country.slug);
  return {
    title: `Doing Business in ${country.name} | Radbit Studios SADC Guide`,
    description: relatedHub
      ? `Guide for Zimbabwean diaspora in ${relatedHub.name} wanting to do business in ${country.name}. Systems, compliance, and software solutions.`
      : `Business systems, compliance automation, and software solutions for companies operating in ${country.name}, SADC.`,
    alternates: { canonical: `/sadc/${country.slug}` },
    openGraph: {
      title: `Doing Business in ${country.name} — SADC Business Guide`,
      description: `Software, compliance, and AI systems for businesses operating in ${country.name}.`,
      url: `${SITE_URL}/sadc/${country.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Doing Business in ${country.name} — SADC Business Guide`,
      description: `Software, compliance, and AI systems for businesses operating in ${country.name}.`,
    },
  };
}

export default function SadcCountryPage({ params }: { params: { country: string } }) {
  const country = getCountryBySlug(params.country);
  if (!country) notFound();

  const relatedHub = DIASPORA_HUBS.find(h => h.slug === country.slug);
  const crumbs = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "SADC", url: `${SITE_URL}/sadc` },
    { name: country.name, url: `${SITE_URL}/sadc/${country.slug}` },
  ]);

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      <section className="container max-w-4xl py-16 md:py-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
          <Globe className="h-3.5 w-3.5" />
          SADC Business Guide
        </div>
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Doing Business in {country.name}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {country.capital}</span>
          <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {country.currency}</span>
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Dial: {country.dialCode}</span>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
          {country.description}
        </p>
      </section>

      <section className="container max-w-4xl pb-16 md:pb-24">
        <h2 className="font-headline text-2xl md:text-3xl font-bold mb-6">Business Systems for {country.name}</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Whether you operate in {country.name} or manage cross-border operations from Zimbabwe,
          Radbit provides custom software, compliance automation, and AI workflow tools
          designed for the SADC business environment.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { title: "Custom Software", desc: `Purpose-built systems for ${country.name}-based operations — inventory, CRM, procurement, and reporting workflows.` },
            { title: "Compliance Automation", desc: "ZIMRA, PRAZ, and SADC cross-border compliance tracking with automated deadline alerts and document management." },
            { title: "AI Workflows", desc: "Enquiry triage, document retrieval, and process automation for teams operating across SADC borders." },
            { title: "Tender Intelligence", desc: `Track government and private tenders in ${country.name} and across the SADC region.` },
          ].map(item => (
            <div key={item.title} className="p-5 rounded-lg border border-border/50 bg-card/50">
              <h3 className="font-headline font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {relatedHub && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 mb-12">
            <h3 className="font-headline text-xl font-bold mb-3">
              For the Zimbabwean Diaspora in {relatedHub.name}
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">{relatedHub.description}</p>
            <Link href="/diaspora" className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline">
              Explore diaspora resources <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className="rounded-2xl border border-border/50 bg-card p-6 md:p-10 text-center">
          <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
            Ready to Build in {country.name}?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
            Start with a free digital readiness assessment. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-border font-medium hover:bg-muted transition-colors">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
