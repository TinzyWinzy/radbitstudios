import type { Metadata } from "next";
import Link from "next/link";
import { howToSchema, breadcrumbSchema } from "@/lib/seo";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitsmehub.co.zw').replace(/\/$/, '');

const pageUrl = '/resources/guides/zim-business-planning';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Business Planning in Zimbabwe — Radbit SME Hub",
    description: "How to build a business plan that works in Zimbabwe's unique economy. Practical templates, local market insights, and funding strategies for Zimbabwean SMEs.",
    alternates: { canonical: pageUrl },
    openGraph: {
      title: "Business Planning in Zimbabwe — A Complete Guide for SMEs",
      description: "Step-by-step business planning guide tailored to Zimbabwe's regulatory and economic environment.",
      url: `${SITE_URL}${pageUrl}`,
    },
  };
}

const steps = [
  {
    name: "Define Your Business Concept",
    text: "Start with a clear value proposition. What problem are you solving? Who are your customers? For Zimbabwean SMEs, consider local challenges like load-shedding, mobile money dependency, and informal market competition.",
  },
  {
    name: "Market Research in the Zimbabwean Context",
    text: "Analyse your target market using ZIMSTAT census data, RBZ monetary policy statements, and industry reports from the Confederation of Zimbabwe Industries (CZI). Identify your competitors — both formal and informal.",
  },
  {
    name: "Financial Projections",
    text: "Build realistic financial forecasts accounting for Zimbabwe's unique factors: multi-currency environment (USD/ZiG), inflation trends, EcoCash transaction fees, and ZIMRA tax obligations (QPD, VAT, PAYE, CIT).",
  },
  {
    name: "Register Your Business",
    text: "Include your PACRA registration, ZIMRA tax clearance, and any sector-specific licences (e.g., EMA for manufacturing, MCAZ for health products). See our guide on business registration.",
  },
  {
    name: "Operations & Risk Plan",
    text: "Address Zimbabwe-specific operational risks: load-shedding backup (solar/battery), fuel availability, foreign currency access, and mobile network reliability. Document your contingency plans.",
  },
];

export default function BusinessPlanningGuide() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema({
            name: "Business Planning in Zimbabwe for SMEs",
            description: "A step-by-step guide to building a business plan that works in Zimbabwe's unique economic environment.",
            steps,
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
            { name: "Business Planning in Zimbabwe", url: pageUrl },
          ])),
        }}
      />

      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/resources" className="hover:text-foreground">Resources</Link>
        <span>/</span>
        <span className="text-foreground">Business Planning</span>
      </nav>

      <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
        Business Planning in Zimbabwe
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        A practical guide to building a business plan that works in Zimbabwe&apos;s unique economy.
      </p>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="font-headline text-2xl font-bold mt-10 mb-4">Why a Written Business Plan Matters in Zimbabwe</h2>
          <p>
            Many Zimbabwean entrepreneurs operate successfully without a formal business plan. But if you&apos;re
            seeking funding from banks like CBZ, NMB, or ZB Bank, applying for government tenders, or
            registering with the Zimbabwe Stock Exchange&apos;s SME board — a written plan is non-negotiable.
          </p>
          <p>
            Beyond fundraising, a business plan helps you navigate Zimbabwe&apos;s dynamic economy: multi-currency
            volatility, load-shedding schedules, and shifting regulatory requirements. It&apos;s your strategic
            roadmap, not just a document for investors.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-2xl font-bold mt-10 mb-6">Step-by-Step Guide</h2>
          {steps.map((step, i) => (
            <div key={i} className="mb-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 size-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{step.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="font-headline text-2xl font-bold mt-10 mb-4">Funding Options for Zimbabwean SMEs</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>CBZ SME Package</strong> — Loans from $500 to $50,000 for registered SMEs with 12-month trading history</li>
            <li><strong>NMB Bank</strong> — Equipment financing and working capital loans for productive sectors</li>
            <li><strong>Empower Bank</strong> — Government-backed funding with single-digit ZiG interest rates</li>
            <li><strong>ZED Fund</strong> — Women and youth entrepreneurship grants through SEDCO</li>
            <li><strong>Impact investors</strong> — Organizations like Addax and Oikocredit funding agri-processing SMEs</li>
            <li><strong>Microfinance</strong> — GetBucks, Lafarge, and Blue Forest for short-term working capital</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-2xl font-bold mt-10 mb-4">Free Templates & Tools</h2>
          <p>Leverage Radbit&apos;s free tools to build key components of your business plan:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><Link href="/resources/tools/business-name-generator" className="text-primary hover:underline">Business Name Generator</Link> — Generate Shona, English, or bilingual names</li>
            <li><Link href="/resources/tools/vat-calculator" className="text-primary hover:underline">VAT Calculator</Link> — Calculate ZIMRA-compliant pricing</li>
            <li><Link href="/toolkit" className="text-primary hover:underline">AI Toolkit</Link> — Use the Business Plan Generator, Slogan Generator, and Financial Projector</li>
            <li><Link href="/resources/guides/zimra-tax-guide-smes" className="text-primary hover:underline">ZIMRA Tax Guide</Link> — Understand your tax obligations from day one</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-2xl font-bold mt-10 mb-4">Common Mistakes to Avoid</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Copying a foreign template</strong> — Zimbabwe&apos;s economy is unique. Use local data, not US/EU benchmarks.</li>
            <li><strong>Ignoring the informal sector</strong> — Most Zimbabwean SMEs operate informally. Address how you&apos;ll compete with or serve this market.</li>
            <li><strong>Over-optimistic revenue</strong> — Factor in load-shedding days, fuel shortages, and ZiG volatility in your projections.</li>
            <li><strong>Skipping the risk section</strong> — Investors want to see you&apos;ve thought about currency risk, regulatory changes, and political stability.</li>
            <li><strong>No digital strategy</strong> — With EcoCash penetration over 90%, a digital payments and marketing strategy is essential.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-2xl font-bold mt-10 mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            Use Radbit&apos;s AI Toolkit to generate business plans, financial projections, and competitor
            analyses in minutes.
          </p>
          <Link
            href="/toolkit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Open the AI Toolkit
          </Link>
        </section>
      </div>
    </div>
  );
}
