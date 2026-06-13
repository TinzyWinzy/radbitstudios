import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronDown, ArrowRight } from "lucide-react";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { faqPageSchema } from "@/lib/seo";
import { AdBanner } from "@/components/ads/ad-banner";

export const metadata: Metadata = {
  title: "FAQ — Radbit",
  description: "Frequently asked questions about Radbit — pricing, features, compliance, and using the enterprise platform.",
  alternates: { canonical: "/resources/faq" },
};

export const dynamic = "force-dynamic";

interface FaqItem {
  category: string;
  question: string;
  answer: string;
  link?: string;
  linkText?: string;
  order: number;
  published: boolean;
}

export default async function FAQPage() {
  const snap = await adminDb
    .collection("faq_items")
    .orderBy("order", "asc")
    .get();

  const allItems = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  const faqItems = allItems.filter(i => i.published);

  const grouped: Record<string, FaqItem[]> = {};
  for (const item of faqItems) {
    const cat = item.category || "Uncategorised";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const jsonLd = faqPageSchema(
    faqItems.map(item => ({ question: item.question, answer: item.answer }))
  );

  return (
    <div className="container max-w-3xl py-8 md:py-16">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">&larr; Back to Resources</Link>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-12">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">Everything you need to know about Radbit, your account, and pricing.</p>
      </header>

      <AdBanner slot="content-banner" className="mb-12" />

      {faqItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-8 text-center">
          <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No FAQs yet. Check back soon or ask the AI Mentor.</p>
          <Link
            href="/mentor"
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:underline"
          >
            Ask the AI Mentor <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
      <div className="flex flex-col gap-10">
        {Object.entries(grouped).map(([category, questions]) => (
          <section key={category}>
            <h2 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {category}
            </h2>
            <div className="space-y-4">
              {questions.map((item) => (
                <details key={item.question} className="group rounded-xl border border-border/50 bg-card/50">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="font-medium pr-4">{item.question}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                    {item.link && (
                      <Link href={item.link} className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:underline">
                        {item.linkText || "Learn more"} <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
      )}
    </div>
  );
}
