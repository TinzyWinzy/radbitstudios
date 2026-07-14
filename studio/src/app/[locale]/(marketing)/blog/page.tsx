import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Rss } from "lucide-react";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const metadata: Metadata = {
  title: "Blog | Radbit",
  description:
    "Practical notes on Zimbabwean business software, tenders, compliance records, tax reminders, and SME operations.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Radbit",
    description:
      "Practical notes on Zimbabwean business software, tenders, compliance records, tax reminders, and SME operations.",
    type: "website",
    url: "/blog",
  },
};

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

export default function BlogPage() {
  return (
    <div className="container py-8 md:py-16">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">Blog</h1>
        <Link
          href="/blog/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors p-2"
          title="RSS Feed"
        >
          <Rss className="size-5" />
        </Link>
      </div>
      <div className="mb-6 md:mb-12 max-w-prose space-y-3">
        <p className="text-muted-foreground">
          Practical notes on building, running, and formalising Zimbabwean businesses.
        </p>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          We write about the things operators actually search for: tender preparation, PRAZ workflows, ZIMRA reminders, business records, diaspora investment checks, and the everyday systems that help a company look credible when a buyer, bank, or partner asks for proof.
        </p>
      </div>

      <NewsletterSignup
        variant="banner"
        title="Get tender alerts, tax deadline reminders, and diaspora investment opportunities"
        description="Join 500+ Zimbabwean entrepreneurs who get our weekly newsletter."
        buttonText="Subscribe Free"
        leadMagnet="ZIMRA Tax Deadline Calendar for 2026"
        className="mb-10"
      />

      <BlogList />
    </div>
  );
}
