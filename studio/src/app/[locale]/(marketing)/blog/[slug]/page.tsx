"use client";

import { useState, useEffect, use } from "react";
import { blogService, type BlogPost } from "@/services/blog.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdBanner } from "@/components/ads/ad-banner";
import { InArticleAd } from "@/components/ads/in-article-ad";
import { MatchedContent } from "@/components/ads/matched-content";

function splitContent(content: string): string[] {
  const parts = content.split(/(?=^#{2,3}\s)/m);
  if (parts.length <= 1) return [content];
  return parts.filter(Boolean);
}

function renderMarkdown(md: string): string {
  const bold = /\*\*(.+?)\*\*/g;
  const italic = /\*(.+?)\*/g;
  const code = /`(.+?)`/g;
  const link = /\[(.+?)\]\((.+?)\)/g;
  const img = /!\[(.+?)\]\((.+?)\)/g;
  const h2 = /^## (.+)/gm;
  const h3 = /^### (.+)/gm;
  const hr = /^---$/gm;
  const ul = /^- (.+)/gm;
  const ol = /^\d+\. (.+)/gm;

  let html = md
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(img, '<img src="$2" alt="$1" class="rounded-xl w-full my-6" />')
    .replace(link, '<a href="$2" class="text-primary underline underline-offset-2">$1</a>')
    .replace(bold, '<strong>$1</strong>')
    .replace(italic, '<em>$1</em>')
    .replace(code, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(h2, '</p><h2 class="font-headline text-2xl font-bold mt-10 mb-4">$1</h2><p class="mb-4">')
    .replace(h3, '</p><h3 class="font-headline text-xl font-semibold mt-8 mb-3">$1</h3><p class="mb-4">')
    .replace(hr, '</p><hr class="my-8 border-border/50" /><p class="mb-4">')
    .replace(ul, '</p><ul class="list-disc pl-6 mb-4 space-y-1"><li>$1</li></ul><p class="mb-4">')
    .replace(ol, '</p><ol class="list-decimal pl-6 mb-4 space-y-1"><li>$1</li></ol><p class="mb-4">');

  if (!html.startsWith('<')) html = `<p class="mb-4">${html}`;
  html += '</p>';

  html = html
    .replace(/<\/p><p class="mb-4"><\/p><h2/g, '</p><h2')
    .replace(/<\/p><p class="mb-4"><\/p><h3/g, '</p><h3')
    .replace(/<\/p><p class="mb-4"><\/p><hr/g, '</p><hr')
    .replace(/<\/p><p class="mb-4"><\/p><ul/g, '</p><ul')
    .replace(/<\/ul><p class="mb-4"><\/p>/g, '</ul>')
    .replace(/<\/ol><p class="mb-4"><\/p>/g, '</ol>')
    .replace(/<p class="mb-4"><\/p>/g, '');

  return html;
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getBySlug(slug).then(p => {
      setPost(p);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return null;
  if (!post) notFound();

  const sections = splitContent(post.content);

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

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
        {post.authorName && <span>{post.authorName}</span>}
        {post.createdAt && (
          <time dateTime={post.createdAt.toDate().toISOString()}>
            {post.createdAt.toDate().toLocaleDateString("en-ZW", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </time>
        )}
      </div>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          className="w-full rounded-xl mb-8 aspect-[16/9] object-cover"
        />
      )}

      <AdBanner />

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {sections.map((section, i) => (
          <div key={i}>
            <div
              className="[&_h2]:font-headline [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-headline [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_li]:text-muted-foreground [&_img]:rounded-xl [&_img]:w-full [&_hr]:border-border/50"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(section) }}
            />
            {i === 0 && <InArticleAd />}
          </div>
        ))}
      </div>

      <MatchedContent />

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
