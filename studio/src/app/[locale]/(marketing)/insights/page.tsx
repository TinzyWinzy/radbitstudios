import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { ARTICLE_CATEGORIES, CONTENT_CLUSTERS } from "@/data/content-clusters";

export const metadata: Metadata = {
  title: "Business Systems & AI Insights | Radbit Studios",
  description: "Practical analysis of custom software, AI automation, web applications and operational systems for Zimbabwean and African businesses.",
  alternates: { canonical: "/insights" },
};

async function getPosts() {
  try {
    const snap = await adminDb.collection("blog_posts").where("published", "==", true).orderBy("createdAt", "desc").limit(24).get();
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: String(data.title || "Untitled"), slug: String(data.slug || ""),
        excerpt: String(data.excerpt || ""), category: String(data.category || "Business Systems"),
        cluster: String(data.cluster || "custom-business-systems"),
        readingMinutes: Number(data.readingMinutes || 5),
        publishedAt: data.publishedAt?.toDate?.()?.toISOString?.() || data.createdAt?.toDate?.()?.toISOString?.() || null,
      };
    });
  } catch { return []; }
}

export default async function InsightsPage() {
  const posts = await getPosts();
  return (
    <main>
      <section className="border-b border-border/60">
        <div className="container py-14 md:py-24">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Radbit Insights</p>
          <h1 className="max-w-4xl font-headline text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">Clear thinking about the systems behind better-run businesses.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Analysis for operators deciding where custom software, automation and AI can remove delay, leakage and administrative work.</p>
        </div>
      </section>

      <section className="container py-12 md:py-20" aria-labelledby="clusters-heading">
        <div className="mb-9 flex items-end justify-between gap-5 border-b border-border pb-5">
          <div><p className="text-sm text-muted-foreground">Explore by operating problem</p><h2 id="clusters-heading" className="mt-1 font-headline text-2xl font-semibold">Core research areas</h2></div>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {CONTENT_CLUSTERS.map((cluster, index) => (
            <Link key={cluster.slug} href={`/insights/${cluster.slug}`} className="group grid gap-3 py-7 transition-colors hover:text-primary md:grid-cols-[4rem_1fr_2fr_auto] md:items-center">
              <span className="text-sm tabular-nums text-muted-foreground">0{index + 1}</span>
              <span className="font-headline text-xl font-semibold">{cluster.name}</span>
              <span className="max-w-2xl text-sm leading-6 text-muted-foreground">{cluster.description}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20">
        <div className="container py-12 md:py-20">
          <div className="mb-9"><p className="text-sm text-muted-foreground">Editorial categories</p><h2 className="mt-1 font-headline text-2xl font-semibold">Latest analysis</h2></div>
          {posts.length ? (
            <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {posts.map(post => <article key={post.id} className="border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{post.category}</p>
                <h3 className="mt-3 font-headline text-xl font-semibold leading-snug"><Link className="hover:text-primary" href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="size-3.5" /> {post.readingMinutes} min read</span>{post.publishedAt && <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString("en-ZW", { year: "numeric", month: "short", day: "numeric" })}</time>}</div>
              </article>)}
            </div>
          ) : <p className="max-w-xl text-muted-foreground">The first research notes are in editorial review. Explore the research areas above or discuss a live operating problem with Radbit.</p>}
          <div className="mt-12 flex flex-wrap gap-2">{ARTICLE_CATEGORIES.map(category => <span key={category} className="border border-border px-3 py-1.5 text-xs text-muted-foreground">{category}</span>)}</div>
        </div>
      </section>

      <section className="container py-14 md:py-20"><div className="max-w-3xl border-l-2 border-primary pl-6 md:pl-9"><p className="text-sm font-semibold text-primary">Have an operational bottleneck?</p><h2 className="mt-2 font-headline text-3xl font-semibold">Start with the workflow, not the technology.</h2><p className="mt-4 text-muted-foreground">We can map the delay, hand-offs and information gaps before recommending a system.</p><Link href="/contact" className="mt-6 inline-flex items-center gap-2 font-medium text-primary">Request a systems assessment <ArrowRight className="size-4" /></Link></div></section>
    </main>
  );
}
