import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Globe } from "lucide-react";
import { ALL_SADC, DIASPORA_HUBS } from "@/data/sadc-countries";

export const metadata: Metadata = {
  title: "Doing Business in SADC Countries | Radbit Studios",
  description: "Business systems, compliance automation, and software solutions for companies operating across all 16 SADC countries. Country-specific guides for Zimbabwean businesses and diaspora.",
  alternates: { canonical: "/sadc" },
  openGraph: {
    title: "SADC Business Guides — Systems & Compliance for Southern Africa",
    description: "Country-specific business guides for SADC: software, compliance, and AI systems for cross-border operations.",
    type: "website",
  },
};

export default function SadcPage() {
  return (
    <div className="min-h-screen">
      <section className="container max-w-5xl py-16 md:py-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
          <Globe className="h-3.5 w-3.5" />
          SADC Region
        </div>
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Doing Business Across SADC
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed mb-6">
          The Southern African Development Community (SADC) is a 16-country bloc with enormous 
          trade, investment, and business opportunity. Radbit builds systems for companies 
          operating across SADC borders — from compliance automation to custom software.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-10">
          {ALL_SADC.map(c => (
            <Link key={c.slug} href={`/sadc/${c.slug}`}
              className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all group">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-headline font-semibold text-sm group-hover:text-primary transition-colors">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.currency} &middot; {c.capital}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="font-headline text-2xl md:text-3xl font-bold mb-2">Diaspora Hubs</h2>
          <p className="text-muted-foreground mb-6">Guides for the Zimbabwean diaspora returning or investing from abroad.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {DIASPORA_HUBS.map(h => (
              <Link key={h.slug} href={`/diaspora`}
                className="p-3 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 transition-all flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-sm font-medium">{h.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
