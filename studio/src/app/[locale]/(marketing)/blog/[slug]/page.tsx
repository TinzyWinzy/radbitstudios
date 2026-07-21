import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Clock3 } from "lucide-react";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { estimateReadingMinutes } from "@/lib/editorial";
import type { BlogPost } from "@/services/blog.service";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

async function getPost(slug: string) {
  const snap = await adminDb.collection("blog_posts").where("slug", "==", slug).where("published", "==", true).limit(1).get();
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  return {
    id: snap.docs[0].id, ...data,
    createdAtIso: data.createdAt?.toDate?.()?.toISOString?.() || null,
    updatedAtIso: data.updatedAt?.toDate?.()?.toISOString?.() || null,
    publishedAtIso: data.publishedAt?.toDate?.()?.toISOString?.() || data.createdAt?.toDate?.()?.toISOString?.() || null,
  } as BlogPost & { createdAtIso: string | null; updatedAtIso: string | null; publishedAtIso: string | null };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug).catch(() => null);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || `Read about ${post.title} — Radbit Studios Zimbabwe`,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAtIso || undefined,
      modifiedTime: post.updatedAtIso || undefined,
      authors: [post.authorName || "Tinotenda Brandon Duma"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug).catch(() => null);
  if (!post) notFound();
  const readingMinutes = post.readingMinutes || estimateReadingMinutes(post.content);
  const clusterUrl = post.cluster ? `/insights/${post.cluster}` : "/insights";

  return <main>
    <article className="container max-w-4xl py-10 md:py-20">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href="/">Home</Link><span aria-hidden> / </span><Link href="/insights">Insights</Link><span aria-hidden> / </span><span>{post.category || "Business Systems"}</span></nav>
      <header className="mt-10 border-b border-border pb-10">
        <Link href={clusterUrl} className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{post.category || "Radbit Insights"}</Link>
        <h1 className="mt-5 max-w-4xl font-headline text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">{post.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{post.authorName || "Tinotenda Brandon Duma"}</span>
          {post.publishedAtIso && <time dateTime={post.publishedAtIso}>Published {new Date(post.publishedAtIso).toLocaleDateString("en-ZW", { year: "numeric", month: "long", day: "numeric" })}</time>}
          {post.updatedAtIso && post.updatedAtIso !== post.publishedAtIso && <time dateTime={post.updatedAtIso}>Updated {new Date(post.updatedAtIso).toLocaleDateString("en-ZW", { year: "numeric", month: "short", day: "numeric" })}</time>}
          <span className="flex items-center gap-1"><Clock3 className="size-4" /> {readingMinutes} min read</span>
        </div>
      </header>

      {post.imageUrl && <Image src={post.imageUrl} alt="" width={1200} height={675} className="mt-10 aspect-[16/9] w-full object-cover" />}

      <aside className="my-10 border-l-2 border-primary bg-muted/20 px-6 py-5"><p className="font-medium">Is this problem showing up in your operation?</p><Link href="/contact" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary">Request a systems assessment <ArrowRight className="size-4" /></Link></aside>

      <div className="mx-auto max-w-[72ch] text-[1.05rem] leading-8">
        {post.content && typeof post.content === "object" ? <RichTextRenderer content={post.content as Record<string, unknown>} /> : <div className="whitespace-pre-wrap text-muted-foreground">{String(post.content || "")}</div>}
      </div>

      {(post.serviceLinks?.length || post.industryLinks?.length || post.relatedSlugs?.length) ? <section className="mt-14 border-t border-border pt-8"><h2 className="font-headline text-2xl font-semibold">Continue exploring</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">
        {post.serviceLinks?.map(path => <Link className="border-b border-border py-3 hover:text-primary" key={path} href={path}>Relevant Radbit service <ArrowRight className="ml-2 inline size-3.5" /></Link>)}
        {post.industryLinks?.map(path => <Link className="border-b border-border py-3 hover:text-primary" key={path} href={path}>Industry solution <ArrowRight className="ml-2 inline size-3.5" /></Link>)}
        {post.relatedSlugs?.map(slug => <Link className="border-b border-border py-3 hover:text-primary" key={slug} href={`/blog/${slug}`}>{slug.replace(/-/g, " ")} <ArrowRight className="ml-2 inline size-3.5" /></Link>)}
      </div></section> : null}

      <footer className="mt-14 border-l-2 border-primary bg-muted/20 p-7 md:p-9"><p className="font-headline text-2xl font-semibold">The sensible next step is a clear diagnosis.</p><p className="mt-3 text-muted-foreground">Map the workflow and quantify the delay before choosing a platform or commissioning software.</p><Link href="/contact" className="mt-5 inline-flex items-center gap-2 font-medium text-primary">Discuss your current workflow <ArrowRight className="size-4" /></Link></footer>
    </article>
  </main>;
}
