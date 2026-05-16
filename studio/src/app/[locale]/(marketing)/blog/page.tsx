import { getAllPosts } from "@/lib/blog";
import Link from "next/link";

export default async function BlogPage() {
  const posts = getAllPosts();

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
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300"
            >
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
              {post.date && (
                <time
                  dateTime={post.date}
                  className="block mt-4 text-xs text-muted-foreground"
                >
                  {new Date(post.date).toLocaleDateString("en-ZW", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
