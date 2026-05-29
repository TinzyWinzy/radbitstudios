"use client";

import Link from "next/link";
import { ArrowRight, Globe, Shield, BarChart, Briefcase, Handshake, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/tilt-card";

const features = [
  {
    icon: <Handshake className="h-5 w-5" />,
    title: "Invest in Verified SMEs",
    body: "Browse PRAZ-compliant Zimbabwean businesses seeking capital. Filter by sector, readiness score, and revenue range. Express interest — get matched.",
    link: "/diaspora/invest",
  },
  {
    icon: <BarChart className="h-5 w-5" />,
    title: "Manage Remotely",
    body: "AI-powered tools to run your Zimbabwe business from abroad. Generate reports, track tenders, and stay compliant — all from your phone.",
    link: "/diaspora/start-business",
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    title: "Tender Alerts",
    body: "Get notified when government and corporate tenders match your business sector. Never miss an opportunity, even when you're thousands of miles away.",
    link: "/sign-up",
  },
];

const howItWorks = [
  { step: "1", title: "Create your free account", desc: "Sign up in under a minute. No credit card required for the Free plan." },
  { step: "2", title: "Set your investment criteria", desc: "Choose sectors, ticket size, and country of residence. Our AI handles the matching." },
  { step: "3", title: "Browse & connect", desc: "Review verified SME profiles, express interest, and unlock contact details when there's a mutual match." },
];

const trustPoints = [
  "PRAZ-compliant SME verification",
  "Team on the ground in Harare",
  "Secure payments via Stripe & EcoCash",
  "POPIA, GDPR & Zimbabwe Cyber Act compliant",
];

export function DiasporaLanding() {
  return (
    <div className="flex flex-col w-full bg-background">
      {/* Hero */}
      <section className="relative py-16 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_60%)]" />
        <div className="container relative z-10 text-center space-y-6 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-4">
            <Globe className="h-3.5 w-3.5" />
            Built for the Zimbabwean Diaspora
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[1.05] text-foreground">
            Run Your Zimbabwe Business from{" "}
            <span className="text-gradient">Anywhere in the World</span>
          </h1>
          <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Invest in verified SMEs, manage remotely, and get local market intelligence — all from one platform. Whether you&apos;re in London, Joburg, or Sydney, we keep you connected to Zimbabwe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/sign-up?redirect=/investor-portal">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/diaspora/invest">Explore Investment Opportunities</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              500+ diaspora entrepreneurs
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              200+ verified SMEs
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-center font-headline text-3xl font-bold mb-12">
            Everything You Need,{" "}
            <span className="text-gradient">Wherever You Are</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {features.map((f) => (
              <TiltCard key={f.title}>
                <div className="p-6 rounded-xl border border-border/50 bg-card h-full flex flex-col">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-headline font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.body}</p>
                  <Link
                    href={f.link}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-4"
                  >
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="container px-4 max-w-4xl mx-auto">
          <h2 className="text-center font-headline text-3xl font-bold mb-12">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary font-headline text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-headline font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background text-sm font-medium text-muted-foreground mb-8">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Trust & Compliance
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 text-center">
        <div className="container px-4 max-w-2xl mx-auto space-y-6">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Join hundreds of diaspora entrepreneurs already using Radbit to invest and manage their Zimbabwe businesses from abroad.
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
