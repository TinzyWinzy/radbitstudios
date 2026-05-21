import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Calendar, Building2, FileCheck, Stamp, Wallet } from "lucide-react";
import { FAQSchema } from "@/components/faq-schema";
import { howToSchema, breadcrumbSchema } from "@/lib/seo";

const F =
  (process.env.FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");

const steps = [
  {
    icon: <Building2 className="h-5 w-5" />,
    title: "Choose Your Business Structure",
    body: "Decide whether you will register as a sole trader (simplest, ~US$50), a private limited company (recommended for growth), or a cooperative. For Zimbabwean SMEs, a private limited company offers the most credibility when applying for tenders and seeking funding.",
  },
  {
    icon: <FileCheck className="h-5 w-5" />,
    title: "Check & Reserve Your Company Name",
    body: "Search the PACRA database to confirm your proposed business name is available. Pay the name reservation fee (~US$30) and reserve for 30 days. Choose a distinct name.",
  },
  {
    icon: <Stamp className="h-5 w-5" />,
    title: "Prepare & Submit Signed Documents to PACRA",
    body: "Prepare Memorandum and Articles of Association, Consent of Directors, Notice of Registered Office, and Directors' details. All directors must provide certified copies of national IDs and proof of residence. Submit at a PACRA office or via e-Services.",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: "Submit & Pay the Registration Fees to PACRA",
    body: "Current fees (2026): registration fee ZWL 5,000–30,000, inspection fee ZWL 4,500, name reservation ZWL 6,000. Process takes 3–7 business days if all documents are in order.",
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: "Register with ZIMRA — Taxpayer Registration",
    body: "Within 30 days of incorporation register with ZIMRA for PAYE, VAT (if annual turnover exceeds $40,000 USD), and QPD. You will receive a TRN and tax clearance certificate — required for government tender applications.",
  },
];

const tips = [
  "Keep all original certificates in a safe place — digital copies are accepted for tender applications but originals are required for banking.",
  "Your PACRA registration number refers to the company; your TRN is the ZIMRA tax number.",
  "A company registered in Zimbabwe can have foreign shareholders, with some sector-specific restrictions.",
  "Registering a trademark at ZIPO protects your brand before competitors copy it.",
  "Consider sole trader registration if you only need a simple trading vehicle — takes 2–3 hours and costs significantly less.",
];

const faq = [
  {
    q: "How much does it cost to register a business in Zimbabwe?",
    a: "For a sole trader: US$30–50. For a private limited company: typically US$150–250 total (PACRA fees, legal drafting, company secretarial).",
  },
  {
    q: "How long does registration take?",
    a: "3–7 business days for a standard company registration, provided all documents are in order. PACRA's e-Services portal can reduce this to same-day with a pre-approved company secretary.",
  },
  {
    q: "Can a foreigner register a business in Zimbabwe?",
    a: "Yes. Foreign investors can register a private limited company or branch. You need a valid passport or residence permit.",
  },
  {
    q: "Do I need a business bank account?",
    a: "Yes for any company registration with shareholders. A sole trader can use a personal account initially, but government tender applications require a separate business bank account in the company name.",
  },
  {
    q: "What is QPD and who needs to pay it?",
    a: "Quarterly Payment Declaration (QPD) is 1.5% of turnover paid quarterly to ZIMRA, regardless of profitability. Small companies with turnover under ~US$12,000 per quarter may be exempt.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "How to Register a Business in Zimbabwe (2026) — Radbit SME Hub",
    description:
      "Complete step-by-step guide to registering a business in Zimbabwe: PACRA company registration, ZIMRA taxpayer registration, tax clearance, and opening a business bank account.",
    alternates: { canonical: "/resources/guides/register-business-zimbabwe" },
    openGraph: {
      title: "How to Register a Business in Zimbabwe (2026)",
      description:
        "Everything you need to know to register your business legally in Zimbabwe — PACRA, ZIMRA, and beyond.",
      type: "article",
      url: `${F}/resources/guides/register-business-zimbabwe`,
    },
  } as Metadata;
}

export default function RegisterBusinessZimbabwePage() {
  const pageUrl = '/resources/guides/register-business-zimbabwe';
  return (
    <div className="container max-w-3xl py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema({
            name: "How to Register a Business in Zimbabwe",
            description: "Step-by-step guide to registering your business with PACRA and ZIMRA in Zimbabwe.",
            steps: steps.map(s => ({ name: s.title, text: s.body })),
            url: pageUrl,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Resources", url: "/resources" },
            { name: "Register a Business in Zimbabwe", url: pageUrl },
          ])),
        }}
      />
      <Link
        href="/resources"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        &larr; Back to Resources
      </Link>

      <article>
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Registration &amp; Compliance</span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How to Register a Business in Zimbabwe (2026)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From choosing your structure to opening a business bank account — a complete walkthrough
            for Zimbabwean entrepreneurs who want to do things the right way.
          </p>
        </header>

        {/* Step-by-step guide */}
        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">5-Step Registration Process</h2>
          <div className="flex flex-col gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                    {step.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-semibold mb-2">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick tips */}
        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">5 Things to Keep in Mind</h2>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{tip}</p>
              </li>
            ))}
          </ul>
        </section>

        <hr className="my-12 border-border/50" />

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faq.map((item, i) => (
              <div key={i}>
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <FAQSchema questions={faq.map(({ q, a }) => ({ question: q, answer: a }))} />
        </section>

        {/* CTA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h3 className="font-headline text-xl font-bold mb-2">Need more help with compliance?</h3>
          <p className="text-muted-foreground mb-4">
            Radbit SME Hub tracks your compliance calendar — tax due dates, licence renewals, and more.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}