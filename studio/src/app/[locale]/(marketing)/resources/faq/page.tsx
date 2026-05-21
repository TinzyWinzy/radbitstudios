import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronDown, ArrowRight } from "lucide-react";
import { faqPageSchema } from "@/lib/seo";
import { AdBanner } from "@/components/ads/ad-banner";

export const metadata: Metadata = {
  title: "FAQ — Radbit SME Hub",
  description: "Frequently asked questions about Radbit SME Hub — pricing, features, compliance, and using the platform.",
  alternates: { canonical: "/resources/faq" },
};

export const revalidate = 3600;

type QnA_t = { q: string; a: string; link?: string; linkText?: string };

const faqItems: { category: string; questions: QnA_t[] }[] = [
  {
    category: "Platform Basics",
    questions: [
      {
        q: "What is Radbit SME Hub?",
        a: "Radbit SME Hub is an AI-powered business platform built for Zimbabwean entrepreneurs. It combines a Digital Readiness Assessment, AI toolkit (business plans, slogans, financial projections), tender matching, community forum, and WhatsApp-powered notifications — all in one place.",
      },
      {
        q: "Who is Radbit for?",
        a: "Primarily for Zimbabwean SME owners and operators — solopreneurs, shopkeepers, agribusiness operators, and small service providers. We also serve SMEs in South Africa, Botswana, Zambia, Mozambique, and Namibia through our SADC regional expansion.",
      },
      {
        q: "Is Radbit free to use?",
        a: "Yes. The Free plan gives you 1 assessment summary, 5 template generations, 10 AI mentor messages, and access to the community. No credit card required. Growth ($5/mo) and Pro ($15/mo) unlock unlimited AI tools, priority support, and invoice generation.",
      },
    ],
  },
  {
    category: "AI & Features",
    questions: [
      {
        q: "How does the AI Toolkit work?",
        a: "The AI Toolkit uses Google Gemini 2.0 Flash for all content generation. You fill in your business details (industry, description, country), then choose a tool — business plan, slogan, competitor analysis, etc. The AI generates a tailored result in seconds. All results are saved to your generation history.",
      },
      {
        q: "Can I use Radbit completely offline?",
        a: "Radbit is installable as a PWA. Your assessment answers auto-save to IndexedDB every 30 seconds while you work, and are restored automatically if you return to the page. Toll broadcast — once you recharge, your data syncs automatically. AI-generated content requires connectivity.",
      },
      {
        q: "Is my business data private?",
        a: "Yes. Your business data, assessment responses, and AI generation history are scoped to your user account. Other users cannot see your data. We do not sell your data. Read more in our Privacy Policy.",
      },
    ],
  },
  {
    category: "Payments & Billing",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "Zimbabwe: EcoCash mobile money and PayNow card payments. South Africa: PayFast. Worldwide: Stripe card payments. We're adding OneMoney (NetOne) next.",
      },
      {
        q: "How do I upgrade or downgrade my plan?",
        a: "Go to Settings → Account & Plan and click the plan you want. Paid plan upgrades redirect to the payment provider; cancellations take effect at the end of your billing period. No pro-rata refunds on downgrades.",
      },
      {
        q: "Do you issue invoices?",
        a: "Yes. Every paid subscription generates a PDF invoice with VAT included at 15% for Zimbabwe transactions. Invoices are downloadable from your Settings → Account page and emailed to your registered address.",
      },
    ],
  },
  {
    category: "Tenders & News Curation",
    questions: [
      {
        q: "Where do you get your tender data?",
        a: "We curate tenders from multiple trusted sources including government procurement portals (ZIMGS, PRAZ, PPRA) and private tender boards. Our AI flow filters for relevance based on your business profile — you only see tenders matched to your industry and capabilities.",
      },
      {
        q: "Can I apply for a tender through Radbit?",
        a: "We currently guide you through the application process. The actual submission goes to the issuing authority. We do not host direct tender submission on the platform.",
      },
    ],
  },
];

export default function FAQPage() {
  const jsonLd = faqPageSchema(faqItems.flatMap(cat =>
    cat.questions.map(item => ({ question: item.q, answer: item.a }))
  ));

  return (
    <div className="container max-w-3xl py-16">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">&larr; Back to Resources</Link>

      {/* Structured data — FAQPage */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-12">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">Everything you need to know about Radbit SME Hub, your account, and pricing.</p>
      </header>

      <AdBanner slot="content-banner" className="mb-12" />

      <div className="flex flex-col gap-10">
        {faqItems.map((cat, ci) => (
          <section key={ci}>
            <h2 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {cat.category}
            </h2>
            <div className="space-y-4">
              {cat.questions.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border/50 bg-card/50">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="font-medium pr-4">{item.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                    {item.link && (
                      <Link href={item.link} className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:underline">
                        {item.linkText || 'Learn more'} <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
