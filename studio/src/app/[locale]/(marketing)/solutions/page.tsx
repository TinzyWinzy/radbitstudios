import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Zap } from "lucide-react";
import { industries, useCases } from "@/data/seo-pages";

export const metadata: Metadata = {
  title: "Solutions for Every Zimbabwean Industry | Radbit",
  description: "Purpose-built business tools for retail, construction, healthcare, education, financial services, and professional firms in Zimbabwe. Free to start.",
  alternates: { canonical: "/solutions" },
};

export const revalidate = 86400;

export default function SolutionsIndexPage() {
  return (
    <div className="container max-w-5xl py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
          <Building2 className="h-3.5 w-3.5" />
          Solutions
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Business Tools for Every Industry
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Purpose-built software for Zimbabwean industries. From retail to construction,
          healthcare to education — Radbit adapts to your business.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {industries.map((page) => (
          <Link
            key={page.slug}
            href={`/solutions/${page.slug}`}
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

      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/20 bg-secondary/5 text-secondary text-sm font-medium mb-6">
          <Zap className="h-3.5 w-3.5" />
          Use Cases
        </div>
        <h2 className="font-headline text-3xl font-bold tracking-tight mb-4">
          What You Can Do with Radbit
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {useCases.map((page) => (
          <Link
            key={page.slug}
            href={`/use-cases/${page.slug}`}
            className="group rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <h3 className="font-headline text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {page.h1}
            </h3>
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
