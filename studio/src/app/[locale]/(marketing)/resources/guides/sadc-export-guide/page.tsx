import Link from "next/link";
import { CheckCircle2, ArrowRight, Globe, FileCheck, Truck, Calculator } from "lucide-react";

const steps = [
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Assess Export Readiness",
    body: "Not every product can be exported as-is. Start with: Is your product fully compliant (standards, certification)? Can you produce at scale (consistent quality, reliable supply)? Do you understand the target country's tariff schedule? Focus first on SADC countries with the same customs currency (USD-based economies like Mauritius, Botswana) before expanding to Rand-zone markets.",
    products: [
      "Agriculture & horticulture (dried fruit, nuts, macadamia)",
      "Dried herbs & traditional medicine",
      "Textiles & garments",
      "Handicrafts & art (woven, carved)",
      "Leather & leather goods",
    ],
  },
  {
    icon: <FileCheck className="h-5 w-5" />,
    title: "Obtain the Right Certifications",
    body: "SADC destinations require proof of origin to benefit from preferential tariffs under the SADC Protocol on Trade. The Certificate of Origin is issued by ZINSA or your local Chamber of Commerce. For agricultural exports, phytosanitary certificates from the Department for Plant Protection are mandatory.",
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: "Understand the Customs Route",
    body: "Most SADC exports move overland via Beitbridge (South Africa) or Chirundu (Zambia), or by air from Harare's RGM International Airport. Road freight to SA takes 2–4 days; air freight costs ~US$3.50–5.00/kg. Under the SADC FTA, over 85% of intra-SADC trade is duty-free, but origin documentation is still required.",
  },
  {
    icon: <Calculator className="h-5 w-5" />,
    title: "Price & Trade Terms",
    body: "Use Incoterms 2020 to structure every transaction clearly. CIF is most common for land border exports. Request a Letter of Credit (LC) before shipping — the safest payment method for first-time exporters.",
  },
];

const faq = [
  {
    q: "Do I need a special export licence to sell within SADC?",
    a: "No separate licence is required for most SADC destinations under the current FTA. Sector-specific requirements apply (agrichemicals require ZINDA registration, food products need a health certificate).",
  },
  {
    q: "Which SADC country is easiest to start with?",
    a: "Botswana is generally the most straightforward — USD is legal tender, eliminating forex risk, and the customs process is streamlined. South Africa offers the largest market but has the most complex SARS customs forms.",
  },
  {
    q: "Can I use EcoCash for export payments?",
    a: "EcoCash is designed for domestic mobile money. International payments require a formal forex account. Use a bank with forex facilities, and consider PayNow for South African buyer payments.",
  },
];

export default function SadcExportGuidePage() {
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
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">SADC Trade</span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
            SADC Export Guide for Zimbabwean SMEs (2026)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            How to tap into regional SADC export markets: trade protocols, customs processes,
            documentation, and cost structures explained.
          </p>
        </header>

        {/* Products available for export */}
        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">What You Can Export Today</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Zimbabwe&apos;s strongest export advantages are agriculture-based products and handcrafted goods.
            These have the highest market demand across SADC and the lowest entry barriers:
          </p>
          <ul className="grid md:grid-cols-2 gap-3 mb-6">
            {(steps[0].products ?? []).map((p, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Step-by-step */}
        <section className="mb-16">
          <h2 className="font-headline text-2xl font-bold mb-6">How to Get Started in 4 Steps</h2>
          <div className="flex flex-col gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">{step.icon}</div>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-semibold mb-2">{i + 1}. {step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
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
        </section>

        {/* CTA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h3 className="font-headline text-xl font-bold mb-2">Match your business with export opportunities</h3>
          <p className="text-muted-foreground mb-4">
            Radbit&apos;s tender engine scans tenders across Zimbabwe and SADC — get matches tailored to your industry.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Find Tenders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
