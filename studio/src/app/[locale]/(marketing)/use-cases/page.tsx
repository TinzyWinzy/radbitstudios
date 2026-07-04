import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { adminDb } from "@/lib/firebase/firebase-admin";

export const metadata: Metadata = {
  title: "Use Cases — What You Can Do with Radbit",
  description: "Tender matching, digital assessments, PRAZ compliance, AI tools — see how Radbit helps Zimbabwean organisations automate and grow.",
  alternates: { canonical: "/use-cases" },
};

export const dynamic = "force-dynamic";

export default async function UseCasesIndexPage() {
  let pages: { slug: string; h1: string; metaDescription: string }[] = [];
  try {
    const snap = await adminDb.collection("seo_pages").where("type", "==", "usecase").where("published", "==", true).get();
    pages = snap.docs.map(d => d.data() as any);
  } catch {}

  return (
    <div className="container max-w-4xl py-8 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
          <Zap className="h-3.5 w-3.5" />
          Use Cases
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">
          What You Can Do with Radbit
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Explore the key ways Zimbabwean businesses use Radbit to automate operations,
          win tenders, and grow.
        </p>
      </div>

      <div className="mb-10 max-w-3xl mx-auto space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          Zimbabwean SMEs face a unique set of challenges: inconsistent power supply, volatile currency markets, complex multi-agency compliance requirements, and limited access to traditional business intelligence. Radbit&apos;s platform is built from the ground up to address these realities &mdash; not as a generic SaaS tool, but as a purpose-engineered operating system for the Zimbabwean enterprise.
        </p>
        <p>
          Each use case below represents a specific workflow that Zimbabwean businesses can automate or streamline through Radbit. From matching tenders published by PRAZ and line ministries to conducting digital readiness assessments aligned with the National Development Strategy, these tools are designed to reduce the operational drag that holds SMEs back.
        </p>
        <p>
          Click through any use case to see how the platform works, what data it draws on, and what outcomes you can expect. If you&apos;re unsure which applies to your business, the <Link href="/assessment" className="text-primary hover:underline">free digital readiness assessment</Link> is a good place to start &mdash; it takes 10 minutes and generates a custom report with actionable recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/use-cases/${page.slug}`}
            className="group rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <h2 className="font-headline text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {page.h1}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
              {page.metaDescription}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Learn more <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
