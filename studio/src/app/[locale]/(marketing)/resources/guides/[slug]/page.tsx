import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { howToSchema, breadcrumbSchema } from "@/lib/seo";
import { FAQSchema } from "@/components/faq-schema";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { AdBanner } from "@/components/ads/ad-banner";
import { InArticleAd } from "@/components/ads/in-article-ad";
import { MatchedContent } from "@/components/ads/matched-content";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";

interface GuideDoc {
  slug: string;
  title: string;
  excerpt: string;
  icon: string;
  readTime: string;
  category: string;
  steps: { icon: string; title: string; body: string }[];
  tips: string[];
  faq: { q: string; a: string }[];
  content: Record<string, unknown> | null;
  published: boolean;
  createdAt?: { toDate?: () => Date };
}

const F = (process.env.FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");

function getIcon(name: string) {
  const icons = LucideIcons as any;
  const Icon = icons[name] || icons.FileText;
  return <Icon className="h-5 w-5" />;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const snap = await adminDb
      .collection("guides")
      .where("slug", "==", params.slug)
      .limit(1)
      .get();
    if (snap.empty) return { title: "Guide Not Found" };
    const guide = snap.docs[0].data() as GuideDoc;
    return {
      title: `${guide.title} — Radbit`,
      description: guide.excerpt,
      alternates: { canonical: `/resources/guides/${guide.slug}` },
      openGraph: {
        title: `${guide.title} — Radbit`,
        description: guide.excerpt,
        type: "article",
        url: `${F}/resources/guides/${guide.slug}`,
      },
    };
  } catch {
    return { title: "Guide" };
  }
}

export const dynamic = "force-dynamic";

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const snap = await adminDb
    .collection("guides")
    .where("slug", "==", params.slug)
    .limit(1)
    .get();

  if (snap.empty) notFound();

  const guide = { id: snap.docs[0].id, ...snap.docs[0].data() } as unknown as GuideDoc;
  if (!guide.published) notFound();

  const pageUrl = `/resources/guides/${guide.slug}`;

  return (
    <div className="container max-w-3xl py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema({
            name: guide.title,
            description: guide.excerpt,
            steps: guide.steps.map(s => ({ name: s.title, text: s.body })),
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
            { name: guide.title, url: pageUrl },
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
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            {getIcon(guide.icon || "FileText")}
            <span className="text-sm font-medium text-primary">{guide.category || "Guide"}</span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {guide.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{guide.excerpt}</p>
        </header>

        <AdBanner slot="guide-banner" className="mb-12" />

        {guide.steps.length > 0 && (
          <section className="mb-16">
            <h2 className="font-headline text-2xl font-bold mb-6">Steps</h2>
            <div className="flex flex-col gap-8">
              {guide.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                      {getIcon(step.icon || "CheckCircle2")}
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
        )}

        <InArticleAd slot="guide-in-article" />

        {guide.tips.length > 0 && (
          <section className="mb-16">
            <h2 className="font-headline text-2xl font-bold mb-6">Things to Keep in Mind</h2>
            <ul className="space-y-3">
              {guide.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{tip}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {guide.content && (
          <section className="mb-16">
            <RichTextRenderer content={guide.content} />
          </section>
        )}

        {guide.faq.length > 0 && (
          <>
            <hr className="my-12 border-border/50" />
            <section className="mb-16">
              <h2 className="font-headline text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {guide.faq.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-semibold mb-2">{item.q}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
              <FAQSchema questions={guide.faq.map(({ q, a }) => ({ question: q, answer: a }))} />
            </section>
          </>
        )}

        <MatchedContent slot="guide-matched" />

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h3 className="font-headline text-xl font-bold mb-2">Need more help?</h3>
          <p className="text-muted-foreground mb-4">
            Radbit has more tools and resources to help your business grow.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <AffiliateDisclosure />
      </article>
    </div>
  );
}
