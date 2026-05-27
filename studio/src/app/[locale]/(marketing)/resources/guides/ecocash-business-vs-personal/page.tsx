import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { breadcrumbSchema } from "@/lib/seo";
import { FAQSchema } from "@/components/faq-schema";
import { AdBanner } from "@/components/ads/ad-banner";
import { InArticleAd } from "@/components/ads/in-article-ad";
import { MatchedContent } from "@/components/ads/matched-content";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";

export const metadata: Metadata = {
  title: "EcoCash Business vs Personal: Which Should You Use for Payments? (2026)",
  description:
    "EcoCash Business vs Personal wallet: a practical comparison of limits, fees, and when each is the right choice for Zimbabwean SMEs.",
  alternates: { canonical: "/resources/guides/ecocash-business-vs-personal" },
  openGraph: { title: "EcoCash Business vs Personal Wallet", description: "A practical comparison for Zimbabwean SMEs on when to use each EcoCash wallet type.", type: "article" },
};

export const revalidate = 3600;

const comparison = [
  { label: "Limit per transaction", personal: "~$500 ZWL-equiv / day", business: "~$2,000–50,000+ / day" },
  { label: "Daily limit", personal: "~$500 ZWL-equiv", business: "~$50,000–500,000 ZWL" },
  { label: "Monthly limit", personal: "~$3,000 ZWL-equiv", business: "~$5M ZWL+" },
  { label: "Registration cost", personal: "Free", business: '"$50–100 registration" + equipment' },
  { label: "POS required", personal: "No", business: "Usually — RangePOS or web:" },
];

const cases = [
  { scenario: "Receiving 3–5 Bookings per Week", recommendation: "Personal wallet is fine — upgrade when you hit the limit", icon: "✅" },
  { scenario: "Running a Shop with >$100/day turnover", recommendation: "Business wallet + immediate upgrade to business", icon: "🔴" },
  { scenario: "Accepting card payments too", recommendation: "RangePOS terminal — covers EcoCash cards + Stanbic/Steward Bank cards", icon: "💳" },
  { scenario: "You need GST / VAT receipts", recommendation: "Business wallet only — only Business classes proper invoice receipts", icon: "📄" },
];

const faq = [
  { q: "How much does EcoCash Business registration cost?", a: "Registration fee is ZWL 50–100 (~US$0.50–1) plus the cost of RangePOS terminal hardware (~US$300–500) or the web merchant setup (~US$20–50)." },
  { q: "Can I have both personal and business EcoCash wallets?", a: "Yes. Many SMEs keep a personal EcoCash for day-to-day transactions and run the business wallet separately. You can register the business wallet under a different phone number." },
  { q: "What fees does EcoCash Business charge?", a: "Merchant transaction fee is typically 1.5% on POS transactions and 1% on merchant transfers. Withdrawal fees also apply at 1% minimum US$0.05. Confirm with your Econet sales agent as fees fluctuate with exchange rate bands." },
  { q: "Is a business wallet needed to apply for EcoCash Merchant?", a: "Yes. You must have an active registered business (PACRA or sole trader registration number) before Ecolinks / EcoCash Merchant can support you." },
  { q: "What about OneMoney — should I also sign up?", a: "OneMoney (NetOne) captures the NetOne subscriber base — significant in Harare and Bulawayo. If the majority of your customers use NetOne phones, adding OneMoney reciprocally expands your customer reach." },
];

export default function EcoCashBusinessVsPersonalPage() {
  return (
    <div className="container max-w-3xl py-16">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Resources", url: "/resources" },
            { name: "EcoCash Business vs Personal", url: "/resources/guides/ecocash-business-vs-personal" },
          ])),
        }}
      />
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">&larr; Back to Resources</Link>
      <article>
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-primary" /><span className="text-sm font-medium text-primary">Mobile Money</span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">EcoCash Business vs Personal</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Which EcoCash wallet should your business use? A practical breakdown of limits, fees, and when each wallet type makes sense.</p>
        </header>

        <AdBanner slot="guide-banner" className="mb-12" />

        <section className="mb-16">
          <div className="rounded-xl overflow-hidden border border-border/70">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 border-b border-border/50">
                  <th className="text-left font-semibold px-6 py-3"></th>
                  <th className="text-left font-semibold px-6 py-3">Personal</th>
                  <th className="text-left font-semibold px-6 py-3">Business</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-card/30" : "bg-transparent"}>
                    <td className="px-6 py-3 font-medium">{row.label}</td>
                    <td className="px-6 py-3 text-muted-foreground">{row.personal}</td>
                    <td className="px-6 py-3 font-medium text-foreground">{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <InArticleAd slot="guide-in-article" />

        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">Two Questions to Ask</h2>
          <ul className="space-y-4">
            {cases.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-lg">{c.icon}</span>
                <div>
                  <strong className="font-medium">{c.scenario}</strong>
                  <p className="text-muted-foreground mt-1">{c.recommendation}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">Quick FAQ</h2>
          <div className="space-y-6">
            {faq.map((item, i) => (
              <div key={i}><h3 className="font-semibold mb-2">{item.q}</h3><p className="text-muted-foreground leading-relaxed">{item.a}</p></div>
            ))}
          </div>
          <FAQSchema questions={faq.map(({ q, a }) => ({ question: q, answer: a }))} />
        </section>

        <MatchedContent slot="guide-matched" />

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8">
          <h3 className="font-headline text-xl font-bold mb-2">Accept all payment channels from one dashboard</h3>
          <p className="text-muted-foreground mb-4">Radbit Payment Orchestrator routes EcoCash, OneMoney, PayNow, and Stripe automatically — no need to manually chase each payment method separately.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"><ArrowRight className="h-4 w-4" /> Sign up free</Link>
        </div>
        <AffiliateDisclosure />
      </article>
    </div>
  );
}
