import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CONTENT_CLUSTERS } from "@/data/content-clusters";
import { breadcrumbSchema } from "@/lib/seo";

const SITE_URL = (process.env.FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");

export function generateStaticParams() {
  return CONTENT_CLUSTERS.map(({ slug }) => ({ cluster: slug }));
}

export function generateMetadata({ params }: { params: { cluster: string } }): Metadata {
  const cluster = CONTENT_CLUSTERS.find((item) => item.slug === params.cluster);
  if (!cluster) return { title: "Insights" };
  return {
    title: `${cluster.pillarTitle} | Radbit Studios`,
    description: cluster.description,
    alternates: { canonical: `/insights/${cluster.slug}` },
  };
}

function ArticleContent({ content }: { content: string }) {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-sm leading-7 text-muted-foreground">
      {paragraphs.map((paragraph, idx) => (
        <p key={idx}>{paragraph}</p>
      ))}
    </div>
  );
}

export default function ClusterPage({ params }: { params: { cluster: string } }) {
  const cluster = CONTENT_CLUSTERS.find((item) => item.slug === params.cluster);
  if (!cluster) notFound();

  const crumbs = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Insights", url: `${SITE_URL}/insights` },
    { name: cluster.name, url: `${SITE_URL}/insights/${cluster.slug}` },
  ]);

  return (
    <main className="container py-12 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/">Home</Link> <span aria-hidden> / </span>
        <Link href="/insights">Insights</Link> <span aria-hidden> / </span>
        <span>{cluster.name}</span>
      </nav>

      <header className="mt-10 max-w-4xl border-b border-border pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pillar guide</p>
        <h1 className="mt-5 font-headline text-4xl font-semibold tracking-tight sm:text-5xl">{cluster.pillarTitle}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{cluster.description}</p>
      </header>

      <section className="py-12 md:py-16">
        <div className="mb-10">
          <p className="text-sm text-muted-foreground">Research roadmap</p>
          <h2 className="mt-1 font-headline text-2xl font-semibold">Questions this guide answers</h2>
        </div>
        <div className="space-y-14">
          {cluster.topics.map((topic) => (
            <article key={topic.slug} className="grid gap-6 md:grid-cols-[3rem_1fr] md:items-start">
              <span className="text-sm tabular-nums text-muted-foreground pt-1">
                {String(cluster.topics.indexOf(topic) + 1).padStart(2, "0")}
              </span>
              <div className="space-y-4">
                <h3 className="font-headline text-xl font-semibold">{topic.title}</h3>
                <ArticleContent content={topic.content} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="border-l-2 border-primary bg-muted/20 p-7 md:p-9">
        <p className="font-headline text-2xl font-semibold">Apply this thinking to your operation.</p>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Describe the current workflow, where it slows down and what the delay costs. Radbit will help determine whether software is a sensible next step.
        </p>
        <Link href="/contact" className="mt-6 inline-flex items-center gap-2 font-medium text-primary">
          Discuss your current workflow <ArrowRight className="size-4" />
        </Link>
      </aside>
    </main>
  );
}
