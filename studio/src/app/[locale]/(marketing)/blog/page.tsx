import { fetchPosts } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import type { Post } from "@/sanity/types";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function BlogPage() {
  const posts: Post[] = await fetchPosts();

  return (
    <div className="container py-16">
      <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Blog</h1>
      <p className="text-muted-foreground mb-12 max-w-lg">
        Thoughts on digital sovereignty, AI, and building for Zimbabwe.
      </p>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug.current}`}
              className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              {post.mainImage && (() => {
                const imgUrl = urlFor(post.mainImage);
                if (!imgUrl) return null;
                return (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={imgUrl.width(600).height(338).url()}
                      alt=""
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                );
              })()}
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories?.map((cat) => (
                    <span
                      key={cat.title}
                      className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
                      {cat.title}
                    </span>
                  ))}
                </div>
                <h2 className="font-headline text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                  {post.author?.name && (
                    <span>{post.author.name}</span>
                  )}
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("en-ZW", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
