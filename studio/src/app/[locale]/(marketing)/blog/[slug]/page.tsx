import { fetchPost, fetchPostSlugs } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import type { Post } from "@/sanity/types";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await fetchPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

const ptComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      const imgUrl = urlFor(value);
      if (!imgUrl) return null;
      return (
        <figure className="my-8">
          <img
            src={imgUrl.width(800).url()}
            alt={value.alt || ""}
            className="rounded-xl w-full"
          />
          {value.caption && (
            <figcaption className="text-sm text-muted-foreground mt-2 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="font-headline text-2xl font-bold mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-headline text-xl font-semibold mt-8 mb-3">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="font-headline text-lg font-semibold mt-6 mb-2">{children}</h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
    ),
  },
  marks: {
    code: ({ children }: any) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ),
    link: ({ value, children }: any) => {
      const href = value?.href;
      if (!href) return children;
      const isExternal = href.startsWith("http");
      return isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
          {children}
        </a>
      ) : (
        <Link href={href} className="text-primary underline underline-offset-2">
          {children}
        </Link>
      );
    },
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-1">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-4 text-muted-foreground space-y-1">{children}</ol>
    ),
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post: Post | null = await fetchPost(params.slug);

  if (!post) notFound();

  return (
    <article className="container max-w-3xl py-16">
      <Link
        href="/blog"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        &larr; Back to blog
      </Link>

      {post.categories && post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((cat) => (
            <span
              key={cat.title}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
            >
              {cat.title}
            </span>
          ))}
        </div>
      )}

      <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">
        {post.title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
        {post.author?.name && (
          <div className="flex items-center gap-2">
            {post.author.image && (() => {
              const authorImgUrl = urlFor(post.author.image);
              if (!authorImgUrl) return null;
              return (
                <img
                  src={authorImgUrl.width(32).height(32).url()}
                  alt={post.author!.name}
                  className="size-8 rounded-full object-cover"
                />
              );
            })()}
            <span>{post.author.name}</span>
          </div>
        )}
        {post.publishedAt && (
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-ZW", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </div>

      {post.mainImage && (() => {
        const mainImgUrl = urlFor(post.mainImage);
        if (!mainImgUrl) return null;
        return (
          <img
            src={mainImgUrl.width(1200).height(675).url()}
            alt=""
            className="w-full rounded-xl mb-12 aspect-[16/9] object-cover"
          />
        );
      })()}

      {post.body && (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <PortableText value={post.body} components={ptComponents} />
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
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
