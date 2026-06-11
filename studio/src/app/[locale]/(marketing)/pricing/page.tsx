import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Zap, Globe, Server,
  Shield, Brain, Palette, Code, Mail, MessageCircle,
} from "lucide-react";
import { subscriptionPlans } from "@/lib/subscriptions";

export const metadata: Metadata = {
  title: "Pricing — Radbit Inc",
  description: "Technology solutions for every stage of your business. Web packages from $150, AI platform from free, ERP systems from $49/mo, and professional services from $500. Built for African SMEs.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Radbit Inc",
    description: "Web design, AI tools, ERP systems, and consulting — all priced for African businesses.",
    type: "website",
  },
};

export const revalidate = 3600;

// ─── Tab Data ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "web", label: "Web Packages", icon: <Globe className="h-4 w-4" /> },
  { id: "saas", label: "AI Platform", icon: <Zap className="h-4 w-4" /> },
  { id: "erp", label: "ERP Systems", icon: <Server className="h-4 w-4" /> },
  { id: "services", label: "Professional Services", icon: <Shield className="h-4 w-4" /> },
] as const;

// ─── Tab 1: Web Packages ─────────────────────────────────────────────────────

const WEB_PACKAGES = [
  {
    name: "Starter Site",
    price: 150,
    tagline: "Get online fast",
    features: [
      "1-page business site",
      "Contact form",
      "Mobile responsive",
      "Hosting setup",
      "1 revision round",
      ".co.zw domain (1st year)",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Business Site",
    price: 400,
    tagline: "Showcase your brand",
    features: [
      "5-page responsive site",
      "Content management (CMS)",
      "SEO basics",
      "Google Analytics",
      "Blog page",
      "2 revision rounds",
      "Hosting + domain (1st year)",
      "5 custom email addresses",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "E-Commerce",
    price: 1000,
    tagline: "Sell online",
    features: [
      "Online store setup",
      "EcoCash / Stripe payments",
      "Product management",
      "Order on WhatsApp",
      "Inventory tracking",
      "3 revision rounds",
      "Hosting + domain (1st year)",
      "10 custom email addresses",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Custom Web App",
    price: 2500,
    tagline: "Built for your workflow",
    features: [
      "Bespoke web application",
      "API integration",
      "Database design",
      "User authentication & roles",
      "Custom admin dashboard",
      "6 months support & maintenance",
      "Performance optimization",
    ],
    cta: "Request Quote",
    popular: false,
  },
];

// ─── Tab 3: ERP Systems ──────────────────────────────────────────────────────

const ERP_TIERS = [
  {
    name: "ERP Starter",
    price: 49,
    tagline: "Essential business tools",
    features: [
      "Cloud-hosted ERP",
      "5 users included",
      "Inventory management",
      "Accounting (GL, P&L, Balance Sheet)",
      "Invoicing & quotations",
      "ZIMRA FDMS compliant",
      "Email support",
      "Monthly backups",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "ERP Business",
    price: 149,
    tagline: "Scale your operations",
    features: [
      "Everything in Starter",
      "25 users included",
      "HR & payroll module",
      "CRM & vendor management",
      "Procurement & purchase orders",
      "Multi-branch support",
      "WhatsApp support",
      "Monthly reports & analytics",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "ERP Enterprise",
    price: 399,
    tagline: "Full operational control",
    features: [
      "Everything in Business",
      "Unlimited users",
      "Custom modules",
      "API integrations",
      "On-premise deployment option",
      "SLA guarantee",
      "Dedicated account manager",
      "24/7 priority support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
  {
    name: "Custom ERP",
    price: null,
    tagline: "Built to your workflows",
    features: [
      "Fully bespoke system",
      "Custom module development",
      "Legacy system migration",
      "Data pipeline & analytics",
      "Training & documentation",
      "Ongoing maintenance & support",
      "Dedicated project team",
    ],
    cta: "Request Quote",
    popular: false,
  },
];

// ─── Tab 4: Professional Services ────────────────────────────────────────────

const SERVICES = [
  {
    name: "Cybersecurity Audit",
    icon: <Shield className="h-6 w-6" />,
    price: 500,
    description: "Protect your digital assets with expert security assessment.",
    features: [
      "Vulnerability assessment",
      "Penetration testing",
      "Network & firewall review",
      "Compliance report (ISO, GDPR)",
      "Remediation plan",
      "Follow-up consultation",
    ],
    cta: "Book Audit",
  },
  {
    name: "Business Strategy",
    icon: <Brain className="h-6 w-6" />,
    price: 800,
    description: "Shape your growth trajectory with tailored strategies.",
    features: [
      "Market analysis",
      "Growth roadmap",
      "Financial projections",
      "Competitive positioning",
      "3-month advisory",
      "Monthly progress reviews",
    ],
    cta: "Get Started",
  },
  {
    name: "Brand Management",
    icon: <Palette className="h-6 w-6" />,
    price: 600,
    description: "Cultivate a strong brand identity for lasting impact.",
    features: [
      "Logo design",
      "Brand guidelines",
      "Social media kit",
      "Business stationery",
      "6-month support",
      "Brand audit & refresh",
    ],
    cta: "Get Started",
  },
  {
    name: "AI/ML Integration",
    icon: <Code className="h-6 w-6" />,
    price: 2000,
    description: "Harness AI to drive innovation in your business.",
    features: [
      "Custom AI solution design",
      "Data pipeline setup",
      "Model training & testing",
      "Production deployment",
      "Performance monitoring",
      "Ongoing optimization",
    ],
    cta: "Request Quote",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Pricing for Digital Infrastructure.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From a free AI platform to enterprise ERP systems and professional consultancy — Radbit delivers technology infrastructure built for Zimbabwean organisations.
          </p>
        </div>

        {/* Tabs — using anchor links for server component */}
        <nav className="flex flex-wrap justify-center gap-2 mb-12 border-b border-border/50 pb-4" aria-label="Pricing categories">
          {TABS.map((tab) => (
            <span
              key={tab.id}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-default"
            >
              {tab.icon}
              {tab.label}
            </span>
          ))}
        </nav>

        {/* ─── Web Packages ─────────────────────────────────────────────── */}
        <section id="web" className="mb-10 md:mb-20 content-visibility-auto">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl font-bold mb-3">Web Packages</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Professional websites and web applications, designed and built for the African market.
              All prices in USD.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WEB_PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  pkg.popular
                    ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                    : "border-border/50 bg-card/30"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most Popular
                  </span>
                )}
                <h3 className="font-headline text-lg font-bold mb-1">{pkg.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{pkg.tagline}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold font-headline">From ${pkg.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">one-time</span>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`mailto:consulting@radbitstudios.co.zw?subject=${encodeURIComponent(pkg.name + " Inquiry")}`}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pkg.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border/50 hover:bg-muted/50"
                  }`}
                >
                  {pkg.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Hosting from $2/mo after 1st year. Domain renewal from $5/yr. Prices may vary based on feature additions.
          </p>
        </section>

        {/* ─── AI Platform (SaaS) ──────────────────────────────────────── */}
        <section id="saas" className="mb-10 md:mb-20 content-visibility-auto">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl font-bold mb-3">AI Platform</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              AI-powered tools for assessments, tender intelligence, mentorship, and compliance — built
              for Zimbabwean SMEs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  plan.name === "Growth"
                    ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                    : "border-border/50 bg-card/30"
                }`}
              >
                {plan.name === "Tender Starter" && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Best for Tenders
                  </span>
                )}
                <h3 className="font-headline text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{plan.description}</p>
                <div className="mb-6">
                  {plan.price === 0 && plan.name === "Free" ? (
                    <span className="text-3xl font-bold font-headline">Free</span>
                  ) : plan.price === 0 ? (
                    <span className="text-3xl font-bold font-headline">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold font-headline">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </>
                  )}
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
                  href={plan.price === 0 && plan.name === "Free"
                    ? "/sign-up"
                    : plan.name === "Enterprise"
                    ? "mailto:sales@radbitstudios.co.zw?subject=Enterprise%20Plan%20Inquiry"
                    : `/sign-up?plan=${plan.name.toLowerCase().replace(/\s+/g, "_")}`}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    plan.name === "Growth" || plan.name === "Pro"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border/50 hover:bg-muted/50"
                  }`}
                >
                  {plan.price === 0 && plan.name === "Free"
                    ? "Get Started Free"
                    : plan.name === "Enterprise"
                    ? "Contact Sales"
                    : `Start ${plan.name}`}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            {[
              { label: "Monthly", note: "Standard billing" },
              { label: "Quarterly", note: "~10% off" },
              { label: "Annual", note: "~25% off" },
            ].map((opt) => (
              <div key={opt.label} className="rounded-lg border border-border/50 p-3 text-center bg-card/30">
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ERP Systems ─────────────────────────────────────────────── */}
        <section id="erp" className="mb-10 md:mb-20 content-visibility-auto">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl font-bold mb-3">ERP Systems</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Streamline operations with integrated accounting, inventory, HR, and CRM.
              ZIMRA FDMS compliant. All prices in USD.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ERP_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  tier.popular
                    ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                    : "border-border/50 bg-card/30"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most Popular
                  </span>
                )}
                <h3 className="font-headline text-lg font-bold mb-1">{tier.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{tier.tagline}</p>
                <div className="mb-6">
                  {tier.price === null ? (
                    <span className="text-3xl font-bold font-headline">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold font-headline">${tier.price}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </>
                  )}
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.price === null
                    ? "mailto:consulting@radbitstudios.co.zw?subject=Custom%20ERP%20Inquiry"
                    : tier.name === "ERP Enterprise"
                    ? "mailto:sales@radbitstudios.co.zw?subject=ERP%20Enterprise%20Inquiry"
                    : "mailto:consulting@radbitstudios.co.zw?subject=" + encodeURIComponent(tier.name + " Inquiry")}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    tier.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border/50 hover:bg-muted/50"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Implementation fee included in first 3 months. All systems ZIMRA FDMS compliant.
            On-site support available at $25/hr.
          </p>
        </section>

        {/* ─── Professional Services ───────────────────────────────────── */}
        <section id="services" className="mb-10 md:mb-20 content-visibility-auto">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl font-bold mb-3">Professional Services</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Expert consultancy to protect, grow, and transform your business.
              Project-based or retainer pricing.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((svc) => (
              <div
                key={svc.name}
                className="rounded-xl border border-border/50 bg-card/30 p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                    {svc.icon}
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold">{svc.name}</h3>
                    <p className="text-xs text-muted-foreground">{svc.description}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold font-headline">From ${svc.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">one-time</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`mailto:consulting@radbitstudios.co.zw?subject=${encodeURIComponent(svc.name + " Inquiry")}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  {svc.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA Section ─────────────────────────────────────────────── */}
        <section className="mb-8 md:mb-16 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-background p-8 md:p-12 text-center">
          <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
            Not sure what you need?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Book a free 30-minute consultation. We&apos;ll assess your needs and recommend
            the right solution — no obligations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:consulting@radbitstudios.co.zw?subject=Free%20Consultation"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Book Free Consultation
            </Link>
            <Link
              href="https://wa.me/263771234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Us
            </Link>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto mb-16 content-visibility-auto">
          <h2 className="font-headline text-fluid-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Do you accept ZiG payments?",
                a: "Yes. We accept ZiG at the prevailing interbank rate (~26 ZiG per USD). EcoCash and bank transfers are available for ZiG payments.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept EcoCash, PayNow (Zimbabwe), PayFast (South Africa), Stripe (credit/debit cards), bank transfers, and ZiG cash. All payments are processed securely.",
              },
              {
                q: "Can I switch between SaaS plans later?",
                a: "Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades apply at the end of your billing period.",
              },
              {
                q: "How long does a web project take?",
                a: "Starter sites: 3-5 business days. Business sites: 1-2 weeks. E-commerce: 2-3 weeks. Custom web apps: 4-8 weeks depending on scope.",
              },
              {
                q: "Do ERP systems include training?",
                a: "Yes. All ERP packages include initial training. Starter: 2 hours. Business: 5 hours. Enterprise: unlimited training sessions.",
              },
              {
                q: "Is there a free trial for the AI platform?",
                a: "The Free plan gives you a full experience with limited credits. You can use every feature before committing to a paid plan.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. You can cancel from your settings page. Your access continues until the end of the current billing period.",
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

        {/* ─── Trust Signals ────────────────────────────────────────────── */}
        <section className="text-center pb-8">
          <p className="text-sm text-muted-foreground">
            Trusted by SMEs across Zimbabwe, South Africa, Botswana, and Zambia.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-4 text-xs text-muted-foreground">
            <span>🔒 Secure Payments</span>
            <span>💳 EcoCash · PayNow · Stripe · PayFast</span>
            <span>🇿🇼 ZiG · USD · ZAR · BWP · ZMW</span>
            <span>📞 24/7 Support</span>
          </div>
        </section>
    </div>
  );
}
