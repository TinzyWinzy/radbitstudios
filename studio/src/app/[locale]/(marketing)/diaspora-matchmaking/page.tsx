import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, Shield, Search, Handshake, Sprout, Building2, Cpu, Factory, Stethoscope, Plane } from "lucide-react";

export const metadata: Metadata = {
  title: "Diaspora Matchmaking — Radbit",
  description:
    "Bridge diaspora capital with verified Zimbabwean SMEs. Discover PRAZ-compliant businesses with transparent operational metrics and get matched with investment opportunities.",
  openGraph: {
    title: "Diaspora Capital Matchmaking — Radbit",
    description:
      "Discover PRAZ-verified Zimbabwean SMEs and invest with confidence. Transparent metrics, sector-aligned matching for diaspora investors.",
  },
};

const sectors = [
  { icon: <Sprout className="h-4 w-4" />, label: "Agri" },
  { icon: <Building2 className="h-4 w-4" />, label: "Real Estate" },
  { icon: <Cpu className="h-4 w-4" />, label: "Tech" },
  { icon: <Factory className="h-4 w-4" />, label: "Manufacturing" },
  { icon: <Stethoscope className="h-4 w-4" />, label: "Healthcare" },
  { icon: <Plane className="h-4 w-4" />, label: "Tourism" },
];

export default function DiasporaMatchmakingPage() {
  return (
    <div className="flex flex-col w-full min-h-full bg-background">
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)]" />
        <div className="container relative z-10 text-center space-y-6 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.07] text-sm font-medium text-white/80 mb-4">
            <Globe className="h-3.5 w-3.5 text-primary" />
            Diaspora Capital Matchmaking
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-white">
            Bridge Diaspora Capital with{" "}
            <span className="text-gradient">Verified Zimbabwean SMEs</span>
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Discover compliant, PRAZ-verified SMEs with transparent operational metrics.
            Invest from anywhere in the world with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-headline font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors font-headline text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="relative py-20 border-t border-white/10">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">
              Why Diaspora Matchmaking
            </span>
            <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-white">
              Invest in Zimbabwe with{" "}
              <span className="text-gradient">Full Transparency</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="h-5 w-5 text-primary" />,
                title: "PRAZ Verified",
                body: "Every SME on the platform has verified PRAZ compliance documentation, so you invest with full regulatory confidence.",
              },
              {
                icon: <Search className="h-5 w-5 text-primary" />,
                title: "Transparent Metrics",
                body: "Access sanitised operational metrics — revenue ranges, readiness scores, and compliance status. No PII, just data you can trust.",
              },
              {
                icon: <Handshake className="h-5 w-5 text-primary" />,
                title: "Sector-Aligned Matching",
                body: "Our platform matches your capital preferences with SMEs in your target sectors — Agri, Real Estate, Tech, Manufacturing, Healthcare, Tourism.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-8 hover:border-primary/30 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-headline text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 border-t border-white/10">
        <div className="container max-5xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">How It Works</span>
            <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-white">
              3 Steps to{" "}
              <span className="text-gradient">Your First Match</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-0 bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Register as Investor",
                body: "Create your diaspora investor profile. Set your country of residence, target sectors, and investment ticket size.",
              },
              {
                step: "02",
                title: "Browse Verified SMEs",
                body: "Explore PRAZ-compliant businesses with transparent metrics. Filter by sector, readiness score, and revenue range.",
              },
              {
                step: "03",
                title: "Express Interest & Get Matched",
                body: "Signal interest in SMEs you like. When mutual interest is confirmed, unlock contact details and take the next step.",
              },
            ].map((step) => (
              <div key={step.step} className="relative group p-8 md:p-10 hover:bg-white/[0.02] transition-colors duration-300">
                <div className="space-y-4">
                  <span className="font-headline text-xs tracking-[0.2em] text-primary/70">{step.step}</span>
                  <h3 className="font-headline text-xl font-bold text-white">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="relative py-20 border-t border-white/10">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <span className="font-headline text-xs tracking-[0.3em] text-primary uppercase">Sectors</span>
            <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-white">
              Invest Across{" "}
              <span className="text-gradient">High-Growth Sectors</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sectors.map((sector) => (
              <div
                key={sector.label}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-white/10 bg-white/[0.03] hover:border-primary/30 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                  {sector.icon}
                </div>
                <span className="font-headline text-sm font-semibold text-white">{sector.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 border-t border-white/10">
        <div className="container text-center space-y-6 max-w-2xl mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-white">
            Ready to Bridge Capital & Opportunity?
          </h2>
          <p className="text-base text-white/60 max-w-lg mx-auto">
            Join diaspora investors already discovering verified Zimbabwean SMEs.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-headline font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
