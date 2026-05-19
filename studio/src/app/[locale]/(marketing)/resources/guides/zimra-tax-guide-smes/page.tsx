import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, BadgeDollarSign, Receipt, FileText, Calculator, BookOpen } from "lucide-react";

const F =
  (process.env.FRONTEND_URL || "https://radbitsmehub.co.zw").replace(/\/$/, "");

const taxes = [
  {
    icon: <BadgeDollarSign className="h-5 w-5" />,
    title: "Quarterly Payment Declaration (QPD)",
    rate: "1.5% of turnover",
    who: "All registered companies and sole traders — even if you made a loss.",
    when: "Every quarter: 31 March, 30 June, 30 September, 31 December.",
    body: "QPD is a provisional tax payment that ZIMRA collects quarterly. It is 1.5% of your top-line revenue — not profit. Even if your business broke even or lost money this quarter, you still file and pay. Companies with quarterly turnover below ~US$12,000 may be exempt. Pay in full at the end of each quarter.",
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: "Value Added Tax (VAT)",
    rate: "15% standard rate",
    who: "Businesses with taxable turnover exceeding US$40,000 annually (voluntary registration also available).",
    when: "VAT returns are filed monthly via the ZIMRA portal. Payment due 30 days after month-end.",
    body: "VAT is ZIMRA's main indirect tax. The standard rate is 15%. Charge VAT on sales (output VAT) and deduct VAT paid on purchases (input VAT). The difference is what you pay ZIMRA. If output VAT is less than input VAT, you get a refund. Keep meticulous VAT invoices.",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "PAYE (Pay-As-You-Earn)",
    rate: "Progressive bands",
    who: "Any business that employs staff — even a single employee.",
    when: "Monthly, by the 10th of the following month.",
    body: "PAYE is ZIMRA's income tax withholding on employee salaries. Deduct the correct amount from each payroll and remit by the 10th of the following month. Failure to remit results in penalties equal to the tax owed, plus interest.",
  },
  {
    icon: <Calculator className="h-5 w-5" />,
    title: "Corporate Income Tax (CIT)",
    rate: "24.72% of net profit",
    who: "All incorporated companies filing annual returns.",
    when: "Annual, due 6 months after financial year-end.",
    body: "CIT is 24.72% of taxable profit. Qualifying SMEs (turnover < US$600,000 per annum) pay 0% CIT on the first US$12,000 and 25% on the balance. ZIMRA is gradually moving to electronic self-assessment. File your CIT return via e-Services.",
  },
];

const tableRows = [
  { turnover: "Up to $12,000 / yr",  rate: "0%",     law: "Small Company Rate" },
  { turnover: "$12,001 – $600,000 / yr", rate: "24%", law: "SME Rate" },
  { turnover: "Over $600,000 / yr",  rate: "24.72%", law: "Standard CIT Rate" },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "ZIMRA Tax Guide for SMEs (2026) — Radbit SME Hub",
    description:
      "Plain-English ZIMRA tax guide covering QPD, VAT, PAYE, and corporate income tax. Learn who pays what, when to file.",
    alternates: { canonical: "/resources/guides/zimra-tax-guide-smes" },
    openGraph: {
      title: "ZIMRA Tax Guide for SMEs (2026)",
      description: "Your plain-English guide to Zimbabwe tax obligations — QPD, VAT, PAYE, and CIT.",
      type: "article",
      url: `${F}/resources/guides/zimra-tax-guide-smes`,
    },
  } as Metadata;
}

export default function ZimraTaxGuidePage() {
  return (
    <div className="container max-w-3xl py-16">
      <Link
        href="/resources"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        &larr; Back to Resources
      </Link>

      <article>
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Tax &amp; Compliance</span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
            ZIMRA Tax Guide for SMEs (2026)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            QPD, VAT, PAYE, and corporate income tax explained for Zimbabwean small business owners —
            no accounting degree required.
          </p>
        </header>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {tableRows.map((row, i) => (
            <div key={i} className="rounded-lg border border-border/50 p-4 text-center bg-card/50">
              <div className="text-2xl font-bold font-headline text-primary">{row.rate}</div>
              <div className="text-xs text-muted-foreground mt-1">{row.turnover}</div>
              <div className="text-xs text-muted-foreground mt-1">{row.law}</div>
            </div>
          ))}
        </div>

        {/* Tax breakdown */}
        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">What You Actually Pay, and When</h2>
          <div className="flex flex-col gap-8">
            {taxes.map((tax, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {tax.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-headline text-lg font-semibold">{tax.title}</h3>
                      <span className="text-sm font-medium text-primary">{tax.rate}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2"><strong>Who pays:</strong> {tax.who}</p>
                    <p className="text-sm text-muted-foreground mb-2"><strong>Due:</strong> {tax.when}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tax.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">Avoid These 5 Common Mistakes</h2>
          <ul className="space-y-3">
            {["Confusing QPD with CIT — they are filed separately and calculated differently",
              "Filing late to save cash — penalties are typically larger than the tax you're avoiding",
              "Not claiming input VAT because you forgot to keep supplier invoices",
              "Mixing personal and business transactions — makes audits harder",
              "Waiting six months to register — ZIMRA can back-date tax liabilities to when you started trading"
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{tip}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h3 className="font-headline text-xl font-bold mb-2">Stay on top of tax deadlines</h3>
          <p className="text-muted-foreground mb-4">
            Radbit SME Hub sends you reminders for every ZIMRA obligation — QPD, VAT, and CIT — so you never miss a filing.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Get Reminders Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
