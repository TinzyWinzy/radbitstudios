import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Rss } from "lucide-react";

/* ── static metadata (server-rendered, indexable by crawlers) ── */
export const metadata: Metadata = {
  title: "Blog — Radbit SME Hub",
  description:
    "Insights on AI for business, tender opportunities, tax and compliance for Zimbabwean SMEs, SADC export, and digital sovereignty.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Radbit SME Hub",
    description:
      "Insights on AI for business, tender opportunities, tax and compliance for Zimbabwean SMEs.",
    type: "website",
    url: "/blog",
  },
};

/* ── blog service is client-side (Firebase SDK) — dynamic-import it ── */
const BlogList = dynamic(
  () =>
    import("./_blog-list.client").then((m) => ({
      default: m.BlogList,
    })),
  { ssr: false, loading: () => <BlogListSkeleton /> }
);

function BlogListSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-6 animate-pulse space-y-3">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-5 w-3/4 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

/* ── page ───────────────────────────────────── */
export default function BlogPage() {
  return (
    <div className="container py-16">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">Blog</h1>
        <Link
          href="/blog/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
          title="RSS Feed"
        >
          <Rss className="size-5" />
        </Link>
      </div>
      <p className="text-muted-foreground mb-12 max-w-lg">
        Thoughts on digital sovereignty, AI, and building for Zimbabwe.
      </p>

      <BlogList />
    </div>
  );
}
