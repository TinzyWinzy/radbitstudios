import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Sun, Zap, Battery, Home, Leaf } from "lucide-react";
import { AdBanner } from "@/components/ads/ad-banner";
import { InArticleAd } from "@/components/ads/in-article-ad";
import { MatchedContent } from "@/components/ads/matched-content";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";

export const metadata: Metadata = {
  title: "Load-Shedding Solutions That Work for Zimbabwean SMEs (2026)",
  description:
    "Comparing solar, inverters, and generators for Zimbabwean SMEs. Real cost-benefit analysis to help you choose the right backup power solution.",
  alternates: { canonical: "/resources/guides/load-shedding-solutions-smes" },
  openGraph: { title: "Load-Shedding Solutions for Zimbabwean SMEs", description: "Solar, inverters, generators — a cost-benefit breakdown tailored for Zimbabwean businesses.", type: "article" },
};

export const revalidate = 3600;

const solutions = [
  {
    icon: <Battery className="h-6 w-6" />,
    title: "Deep Cycle Battery (with Inverter)",
    desc: "The entry-level standby: 200Ah deep-cycle batteries charged during daytime power, feeding an inverter at night. Typical setup: 2 x 200Ah batteries (~US$450 total) + 1,000W inverter (~US$180) + 2 x 200W solar panels (~US$300). Can run a laptop, router, POS, and phone charger simultaneously for 4–6 hours nightly without ZESA.",
    pros: ["Cheapest entry point", "Silent, no fuel needed", "Can be expanded incrementally"],
    cons: ["Discharge limits battery life (2–4 years)", "Cannot run high-power devices (kettle, cooker)"],
    bestFor: "Home-based small traders",
    price: "US$800–1,200 fully installed",
  },
  {
    icon: <Home className="h-6 w-6" />,
    title: "Split Solar / Hybrid System",
    desc: "Solar panels charge batteries (just above) supplemented by a grid or generator charge controller. The inverter automatically switches between sources. Total system: 4 x 200W solar panels + 4 x 200Ah batteries + 3kVA inverter + MPPT controller. This is the most common SME configuration in Harare and Bulawayo as of 2026.",
    pros: ["Runs on solar for majority of July–Oct", "Low running costs after installation", "Handles 8-hour Stage 4 loadshedding per battery bank"],
    cons: ["High upfront cost — US$1,500–3,000", "Requires roof space", "Battery replacement every 3–5 years"],
    bestFor: "Shop, restaurant, office",
    price: "US$2,000–4,000 fully installed",
  },
  {
    icon: <Sun className="h-6 w-6" />,
    title: "Full Solar Setup with LiFePO4 + AC Coupling",
    desc: "Most resilient and cost-effective solution at scale. Replace lead-acid batteries with lithium iron phosphate (LiFePO4). A 5kWh LiFePO4 bank (~US$500–700) delivers 5,000 cycles (~10 years) with 90% depth of discharge. Coupled with a 3,000VA hybrid inverter and 5 x 200W panels total cost is 2026-competitive against inflation-adjusted alternatives.",
    pros: ["10-year battery life vs 2–3 years for lead-acid", "90% discharge depth vs 50%", "Virtually no maintenance"],
    cons: ["Highest upfront cost", "Requires electrician certification for wiring"],
    bestFor: "Growing SMEs aiming for Stage-4 resilience",
    price: "US$3,500–6,000 fully installed",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Generator (Petrol or Diesel)",
    desc: "A traditional leki — 5kVA petrol generator (~US$400–550) runs a fridge, lights, and laptop for 6–8 hours on one liter of fuel (~6 hours runtime per litre). A diesel generator is more fuel-efficient but costs triple. Easiest to install and relocate; highest long-term cost multiplier.",
    pros: ["Cheapest upfront cost", "Plug-and-play — no installation", "High power output"],
    cons: ["Highest long-term running cost (~US$1,000+ per year fuel)", "Loud, produces fumes", "Fuel shortages in rural areas"],
    bestFor: "Temporary / field operations",
    price: "US$300–800 model",
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    title: "Community Solar Pooling (co-op model)",
    desc: "Some SMEs in suburban Harare pool resources to install a shared solar/wind hybrid, splitting output and cost proportionally. Solar pooling spreads the capital cost (battery banks, inverters) across 2–5 businesses while still giving each business dedicated access.",
    pros: ["Cost is shared — reduces per-business capital by 40–60%", "Battery bank is shared — better ambient airflow, longer life", "Community governance reduces fault neglect"],
    cons: ["Requires trust between partners", "Sole operator still handles billing, disputes"],
    bestFor: "Shop clusters in residential zones",
    price: "US$500–1,500 per business depending on size",
  },
];

const tips = [
  "Bangladesh is the global benchmark — Zimbabwe imports 6MW+ in solar products per year for residential and SME",
  "Always buy a genuine MPPT controller (PWM controllers waste 15–20% of panel output)",
  "Monitor kWh output from Day 1 — Log this on paper or in a spreadsheet, not the inverter's short-term memory",
  "A UPS is NOT a backup power solution — it gives you 10–15 minutes, nothing more",
  "Think about Phase 2: design your installation so you can add 2 more panels + 2 more batteries next year",
];

export default function LoadSheddingSolutionsPage() {
  return (
    <div className="container max-w-3xl py-16">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">&larr; Back to Resources</Link>
      <article>
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" /><span className="text-sm font-medium text-primary">Infrastructure</span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">Load-Shedding Solutions That Work for Zimbabwean SMEs (2026)</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Solar, inverters, generators — a current-day cost-benefit breakdown so you can make the right call for your budget and business type.</p>
        </header>

        <AdBanner slot="guide-banner" className="mb-12" />

        <section className="mb-12">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-6 text-center">
            <p className="font-headline text-lg mb-2">📌 Quick Before Buying</p>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Stage 4 loadshedding (~12 hours off per day) is the baseline 2026 assumption. Size your inverter + battery bank for worst-case, not best-case. Under-size and you lose stock, data, and customer trust.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">5 Options Compared</h2>
          <div className="flex flex-col gap-8">
            {solutions.map((s, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline text-lg font-semibold mb-1">{s.title}</h3>
                    <p className="text-sm text-primary font-medium mb-2">{s.price}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
                    <div className="flex flex-wrap gap-3 mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">✓ {s.bestFor}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm mt-2">
                      <span className="text-green-500">Pros: {s.pros.join(", ")}</span>
                      <span className="text-red-400">Cons: {s.cons.join(", ")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <InArticleAd slot="guide-in-article" />

        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">5 Things to Check Before Buying</h2>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><p className="text-muted-foreground">{tip}</p></li>
            ))}
          </ul>
        </section>

        <MatchedContent slot="guide-matched" />

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h3 className="font-headline text-xl font-bold mb-2">Calculate your backup power ROI</h3>
          <p className="text-muted-foreground mb-4">Radbit saves you from stock spoilage, data loss, and lost customers during loadshedding — our digital tools and notifications keep your business running when the grid doesn&apos;t.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <AffiliateDisclosure />
      </article>
    </div>
  );
}
