"use client";

import Link from "next/link";
import { ArrowRight, Building2, Globe, FileText, Shield, Calculator, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: <FileText className="h-5 w-5" />,
    title: "1. Register Your Company",
    body: "Register with the Companies and Deeds Office via the ZIMRA e-services portal. You can appoint a local representative if you're not physically present. Most registrations take 5-10 working days.",
  },
  {
    icon: <Calculator className="h-5 w-5" />,
    title: "2. Get Tax Compliant",
    body: "Register for VAT, PAYE, and NSSA through ZIMRA. Our Tax Co-Pilot AI tool can guide you through the requirements and filing deadlines.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "3. PRAZ Compliance",
    body: "Register with the Procurement Regulatory Authority to qualify for government tenders. Our platform helps you navigate the documentation.",
  },
  {
    icon: <Wand2 className="h-5 w-5" />,
    title: "4. Use AI to Operate",
    body: "Use Radbit's AI tools to generate business plans, track tenders, manage budgets, and get market insights — all from your phone or laptop.",
  },
];

export function StartBusinessPage() {
  return (
    <div className="flex flex-col w-full bg-background">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.06),transparent_60%)]" />
        <div className="container relative z-10 max-w-3xl mx-auto px-4 space-y-6">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tighter leading-[1.05]">
            Start a Business in Zimbabwe{" "}
            <span className="text-gradient">from the Diaspora</span>
          </h1>
          <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
            Whether you&apos;re in London, Cape Town, Perth, or Texas — you can register, operate, and grow a Zimbabwean business remotely. Here&apos;s the step-by-step guide, plus the AI tools to make it happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/sign-up">
                Get Started with AI Tools <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/diaspora/invest">Browse Investment Opportunities</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 max-w-3xl mx-auto">
          <h2 className="text-center font-headline text-2xl font-bold mb-10">
            Remote Business Setup — Step by Step
          </h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.title} className="flex gap-4 p-5 rounded-xl border border-border/50 bg-card">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-headline font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background text-sm font-medium text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-primary" />
            Built for diaspora entrepreneurs
          </div>
          <h2 className="font-headline text-2xl font-bold">Key Considerations</h2>
          <div className="grid gap-4 sm:grid-cols-2 text-left">
            {[
              { q: "Can I register remotely?", a: "Yes — you can register a company through ZIMRA's e-services portal and appoint a local representative." },
              { q: "What taxes apply?", a: "Corporate tax (24%), VAT (15%), PAYE, and withholding taxes. Our Tax Co-Pilot helps you stay compliant." },
              { q: "Can I open a bank account?", a: "Yes, but you may need to visit in person or work with banks that offer diaspora accounts (Stanbic, CABS, Steward Bank)." },
              { q: "How do I manage from abroad?", a: "Use Radbit's AI platform for tender alerts, budget tracking, compliance checks, and business insights." },
            ].map((item) => (
              <div key={item.q} className="p-4 rounded-lg border border-border/50 bg-card">
                <p className="font-medium text-sm">{item.q}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 text-center bg-muted/30">
        <div className="container px-4 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background text-sm font-medium text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            AI-powered tools for remote management
          </div>
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Create your free account and access AI tools for tax compliance, tender tracking, budget management, and business insights — all from your phone.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href="/sign-up">
              Create Your Free Account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
