import type { BlogPost, EditorialStatus } from "@/services/blog.service";

export function resolveEditorialStatus(post: Pick<BlogPost, "status" | "published">): EditorialStatus {
  return post.status || (post.published ? "published" : "draft");
}

export function estimateReadingMinutes(content: BlogPost["content"]): number {
  const raw = typeof content === "string" ? content : JSON.stringify(content || "");
  const words = raw.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function isPublicPost(post: Pick<BlogPost, "status" | "published">): boolean {
  return resolveEditorialStatus(post) === "published";
}
