import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { useCases } from "@/data/seo-pages";

export const metadata: Metadata = {
  title: "Use Cases — What You Can Do with Radbit | SME Tools Zimbabwe",
  description: "Tender matching, digital assessments, PRAZ compliance, AI business tools — see how Radbit helps Zimbabwean SMEs automate and grow.",
  alternates: { canonical: "/use-cases" },
};

export const revalidate = 86400;

export default function UseCasesIndexPage() {
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

      <div className="grid md:grid-cols-2 gap-6">
        {useCases.map((page) => (
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
