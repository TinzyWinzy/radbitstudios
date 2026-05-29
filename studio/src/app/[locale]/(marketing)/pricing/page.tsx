import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap, Sparkles, Building2 } from "lucide-react";
import { subscriptionPlans } from "@/lib/subscriptions";
import { AdBanner } from "@/components/ads/ad-banner";

export const metadata: Metadata = {
  title: "Pricing — Radbit SME Hub",
  description: "Free, Growth ($5/mo), Tender Starter ($10/mo), and Pro ($15/mo) plans for Zimbabwean SMEs. AI tools, assessments, tender matching, and PRAZ compliance. No credit card required.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Radbit SME Hub",
    description: "Start free. Grow with $5/mo. Get unlimited tenders at $10/mo. AI tools built for Zimbabwean SMEs.",
    type: "website",
  },
};

export const revalidate = 3600;

const PLAN_ICONS = [null, <Zap key="growth" className="h-5 w-5" />, <Building2 key="tender-starter" className="h-5 w-5" />, <Sparkles key="pro" className="h-5 w-5" />, <Building2 key="enterprise" className="h-5 w-5" />] as const;

const highlightFeatures = [
  "Assessment Summaries",
  "Export Assessments",
  "Template Generations",
  "AI Mentor Messages",
  "Logo Generations",
  "Dashboard Insights",
  "Tenders Curation",
  "Tender Proposals (Bid Writer)",
  "Tax Co-Pilot",
  "Direct Messaging",
  "PRAZ Compliance Tools",
  "Community Post Analytics",
];

function getFeatureAvailability(planIndex: number, feature: string): string {
  const plan = subscriptionPlans[planIndex];
  if (!plan) return '—';
  const creditMap: Record<string, { remaining: number }> = {
    'Assessment Summaries': plan.credits.assessmentSummary,
    'Export Assessments': plan.credits.exportAssessment,
    'Template Generations': plan.credits.templateGeneration,
    'AI Mentor Messages': plan.credits.mentorChat,
    'Logo Generations': plan.credits.logoGeneration,
    'Dashboard Insights': plan.credits.dashboardInsights,
    'Tenders Curation': plan.credits.tendersCuration,
    'Tender Proposals (Bid Writer)': plan.credits.tenderProposal,
    'Tax Co-Pilot': plan.credits.taxCopilot,
  };
  const credit = creditMap[feature];
  if (!credit) {
    if (feature === 'Direct Messaging') return planIndex >= 1 ? '✓' : '—';
    if (feature === 'Community Post Analytics') return planIndex >= 2 ? '✓' : '—';
    if (feature === 'PRAZ Compliance Tools') return planIndex >= 2 ? '✓' : '—';
    return '—';
  }
  if (credit.remaining >= 999) return 'Unlimited';
  if (credit.remaining >= 100) return `${credit.remaining}`;
  return `${credit.remaining}`;
}

export default function PricingPage() {
  return (
    <div className="container max-w-5xl py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
        &larr; Back to Home
      </Link>

      <header className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          First month 50% off — all paid plans
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Simple Pricing for Zimbabwean SMEs
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Start for free. Upgrade when you&apos;re ready. All plans include AI tools, tender matching, and community access.
        </p>
      </header>

      <div className="grid md:grid-cols-4 gap-6 mb-16">
        {subscriptionPlans.map((plan, i) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border p-6 flex flex-col ${
              plan.name === 'Growth'
                ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/5'
                : 'border-border/50 bg-card/30'
            }`}
          >
            {(plan.name === 'Tender Starter') && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                Best for Tenders
              </span>
            )}
            <div className="flex items-center gap-2 mb-4">
              {PLAN_ICONS[i]}
              <h2 className="font-headline text-lg font-bold">{plan.name}</h2>
            </div>
            <div className="mb-6">
              {plan.price === 0 ? (
                <span className="text-3xl font-bold font-headline">Free</span>
              ) : (
                <>
                  <span className="text-3xl font-bold font-headline">${plan.price}</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </>
              )}
              <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={plan.price === 0 ? '/sign-up' : '/sign-up?plan=' + plan.name.toLowerCase().replace(/\s+/g, '_')}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                plan.price === 0
                  ? 'border border-border/50 hover:bg-muted/50'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {plan.price === 0 ? 'Get Started Free' : `Start ${plan.name}`}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      <AdBanner slot="content-banner" className="mb-16" />

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold mb-8 text-center">Feature Comparison</h2>
        <div className="rounded-xl overflow-hidden border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/5 border-b border-border/50">
                <th className="text-left font-semibold px-4 py-3">Feature</th>
                {subscriptionPlans.map((p) => (
                  <th key={p.name} className="text-center font-semibold px-4 py-3">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {highlightFeatures.map((feature, fi) => (
                <tr key={feature} className={fi % 2 === 0 ? 'bg-card/30' : 'bg-transparent'}>
                  <td className="px-4 py-3 font-medium">{feature}</td>
                  {subscriptionPlans.map((_, pi) => (
                    <td key={pi} className="px-4 py-3 text-center text-muted-foreground">
                      {getFeatureAvailability(pi, feature)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold mb-6 text-center">Billing Options</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { label: 'Monthly', discount: '' },
            { label: 'Quarterly', discount: '~10% off', extra: '× 3 months' },
            { label: 'Annual', discount: '~25% off', extra: '× 12 months' },
          ].map((opt) => (
            <div key={opt.label} className="rounded-xl border border-border/50 p-5 text-center bg-card/30">
              <h3 className="font-headline font-semibold mb-2">{opt.label}</h3>
              <p className="text-sm text-muted-foreground">{opt.discount || 'Standard billing'}</p>
              {opt.extra && <p className="text-xs text-muted-foreground mt-1">{opt.extra}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto">
        <h2 className="font-headline text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Can I switch plans later?',
              a: 'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades apply at the end of your billing period.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept EcoCash, PayNow (Zimbabwe), PayFast (South Africa), and Stripe (credit/debit cards). All payments are processed securely.',
            },
            {
              q: 'Is there a free trial for paid plans?',
              a: 'The Free plan gives you a full experience with limited credits. You can use every feature before committing to a paid plan.',
            },
            {
              q: 'What happens when I hit my credit limit?',
              a: 'You can upgrade to a higher tier or wait until your credits reset at the next billing cycle. Unused credits do not roll over.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. You can cancel from your settings page. Your access continues until the end of the current billing period.',
            },
          ].map((item) => (
            <details key={item.q} className="group rounded-xl border border-border/50 bg-card/50">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-medium">{item.q}</span>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
