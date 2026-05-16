import { getPost, getAllPostSlugs } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) notFound();

  return (
    <article className="container max-w-3xl py-16">
      <Link
        href="/blog"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        &larr; Back to blog
      </Link>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">
        {post.title}
      </h1>

      {post.date && (
        <time
          dateTime={post.date}
          className="block text-sm text-muted-foreground mb-12"
        >
          {new Date(post.date).toLocaleDateString("en-ZW", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}

      <div
        className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-headline prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
          prose-a:text-primary prose-a:underline prose-a:underline-offset-2
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
          prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-4
          prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-1
          prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-1
          prose-li:text-muted-foreground
          prose-img:rounded-xl prose-img:w-full
          prose-hr:border-border/50"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border/50">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
