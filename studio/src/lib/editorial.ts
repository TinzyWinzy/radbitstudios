import type { BlogPost, EditorialStatus } from "@/services/blog.service";

export type EditorialCheck = { id: string; label: string; passed: boolean; blocking: boolean; detail: string };

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

export function validateEditorialPost(post: Partial<BlogPost>): EditorialCheck[] {
  const gates = post.reviewGates;
  const paths = [...(post.serviceLinks || []), ...(post.industryLinks || [])];
  return [
    { id: "title", label: "Search title", passed: (post.metaTitle || "").length >= 30 && (post.metaTitle || "").length <= 65, blocking: true, detail: "Use a distinct 30–65 character meta title." },
    { id: "description", label: "Meta description", passed: (post.metaDescription || "").length >= 90 && (post.metaDescription || "").length <= 170, blocking: true, detail: "Summarise the decision value in 90–170 characters." },
    { id: "brief", label: "Content brief", passed: Boolean(post.editorial?.primaryKeyword && post.editorial?.searchIntent), blocking: true, detail: "Generate or complete the editorial brief." },
    { id: "service-link", label: "Service link", passed: (post.serviceLinks?.length || 0) >= 1, blocking: true, detail: "Link to at least one relevant service." },
    { id: "industry-link", label: "Industry link", passed: (post.industryLinks?.length || 0) >= 1, blocking: false, detail: "Add a relevant industry solution where appropriate." },
    { id: "related", label: "Related articles", passed: (post.relatedSlugs?.length || 0) >= 2, blocking: true, detail: "Connect at least two related articles." },
    { id: "paths", label: "Internal-link format", passed: paths.every(path => path.startsWith("/") && !path.includes(" ")), blocking: true, detail: "Internal paths must start with / and contain no spaces." },
    { id: "claims", label: "Factual claims reviewed", passed: Boolean(gates?.factualClaimsChecked), blocking: true, detail: "Verify claims and citations against authoritative sources." },
    { id: "firsthand", label: "Firsthand context", passed: Boolean(gates?.firsthandContextAdded), blocking: true, detail: "Add Tinotenda’s genuine project or operational context." },
    { id: "boundaries", label: "Proof boundaries", passed: Boolean(gates?.proofBoundariesChecked), blocking: true, detail: "Distinguish built, demonstrated, deployed and validated." },
    { id: "links-reviewed", label: "Links reviewed", passed: Boolean(gates?.internalLinksChecked), blocking: true, detail: "Open and review every internal and external link." },
  ];
}

export function canAdvanceEditorialStatus(status: EditorialStatus, checks: EditorialCheck[]): boolean {
  if (status === "draft" || status === "review") return true;
  return checks.filter(check => check.blocking).every(check => check.passed);
}

export function isStalePost(post: Pick<BlogPost, "status" | "published" | "updatedAt">, now = Date.now()): boolean {
  if (resolveEditorialStatus(post) !== "published" || !post.updatedAt?.toMillis) return false;
  return now - post.updatedAt.toMillis() > 180 * 24 * 60 * 60 * 1000;
}
