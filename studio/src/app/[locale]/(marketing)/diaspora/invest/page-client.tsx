"use client";

import Link from "next/link";
import { ArrowRight, Handshake, Shield, BarChart, Globe, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const sectors = [
  { label: "Agriculture", desc: "Farming, agro-processing, and food supply" },
  { label: "Technology", desc: "Software, fintech, and digital services" },
  { label: "Manufacturing", desc: "Production, packaging, and industrial supply" },
  { label: "Healthcare", desc: "Clinics, pharmacies, and medical supply" },
  { label: "Real Estate", desc: "Construction, property development, and management" },
  { label: "Tourism", desc: "Lodges, travel services, and hospitality" },
];

const benefits = [
  { icon: <Shield className="h-4 w-4" />, text: "PRAZ-verified compliance documentation" },
  { icon: <BarChart className="h-4 w-4" />, text: "Digital readiness scores for every SME" },
  { icon: <Globe className="h-4 w-4" />, text: "Invest from anywhere — UK, SA, USA, Australia" },
  { icon: <CheckCircle2 className="h-4 w-4" />, text: "Mutual-interest matching — only connect when both parties say yes" },
];

export function InvestPage() {
  return (
    <div className="flex flex-col w-full bg-background">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.06),transparent_60%)]" />
        <div className="container relative z-10 max-w-3xl mx-auto px-4 space-y-6">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tighter leading-[1.05]">
            Invest in Zimbabwean SMEs{" "}
            <span className="text-gradient">from the Diaspora</span>
          </h1>
          <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
            Access a curated marketplace of verified, PRAZ-compliant Zimbabwean businesses seeking capital. Filter by sector, readiness score, and revenue range — then express interest and get matched when there&apos;s mutual intent.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/sign-up?redirect=/investor-portal">
                Sign Up to Browse SMEs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/diaspora/start-business">Start a Business Instead</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 max-w-4xl mx-auto">
          <h2 className="text-center font-headline text-2xl font-bold mb-8">Sectors You Can Invest In</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {sectors.map((s) => (
              <div key={s.label} className="p-4 rounded-lg border border-border/50 bg-card">
                <h3 className="font-semibold text-sm">{s.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 max-w-2xl mx-auto">
          <h2 className="text-center font-headline text-2xl font-bold mb-8">Why Invest Through Radbit</h2>
          <div className="space-y-4">
            {benefits.map((b) => (
              <div key={b.text} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                  {b.icon}
                </div>
                <p className="text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 text-center bg-muted/30">
        <div className="container px-4 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background text-sm font-medium text-muted-foreground">
            <Handshake className="h-3.5 w-3.5 text-primary" />
            Get matched with verified SMEs
          </div>
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            Ready to Invest?
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Create your free account and browse verified Zimbabwean businesses seeking investment. No commitment — just discovery.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href="/sign-up?redirect=/investor-portal">
              Create Your Free Account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
