"use client";

import { useState, useEffect } from "react";
import { blogService, type BlogPost } from "@/services/blog.service";
import Link from "next/link";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.listPublished().then(p => {
      setPosts(p);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container py-16">
      <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Blog</h1>
      <p className="text-muted-foreground mb-12 max-w-lg">
        Thoughts on digital sovereignty, AI, and building for Zimbabwe.
      </p>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-6 animate-pulse">
              <div className="h-4 w-16 bg-muted rounded mb-4" />
              <div className="h-5 w-3/4 bg-muted rounded mb-3" />
              <div className="h-4 w-full bg-muted rounded mb-2" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              {post.imageUrl && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5">
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="font-headline text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                  {post.authorName && <span>{post.authorName}</span>}
                  {post.createdAt && (
                    <time dateTime={post.createdAt.toDate().toISOString()}>
                      {post.createdAt.toDate().toLocaleDateString("en-ZW", {
                        year: "numeric", month: "short", day: "numeric",
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
