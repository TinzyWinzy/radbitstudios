import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase/firebase-admin";

const SITE_URL = (process.env.FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastMod = new Date().toISOString().split("T")[0];

  const staticPages = [
    { url: SITE_URL, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${SITE_URL}/resources`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/resources/faq`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${SITE_URL}/solutions`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/use-cases`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/sign-up`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/sign-in`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const blogSnap = await adminDb.collection("blog_posts").where("published", "==", true).get();
    blogPosts = blogSnap.docs.map((d) => {
      const post = d.data();
      return {
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt?.toDate?.()?.toISOString?.().split("T")[0] || lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });
  } catch {}

  let guides: MetadataRoute.Sitemap = [];
  try {
    const guideSnap = await adminDb.collection("guides").where("published", "==", true).get();
    guides = guideSnap.docs.map((d) => {
      const g = d.data();
      return {
        url: `${SITE_URL}/resources/guides/${g.slug}`,
        lastModified: g.updatedAt?.toDate?.()?.toISOString?.().split("T")[0] || lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      };
    });
  } catch {}

  let seoPages: MetadataRoute.Sitemap = [];
  try {
    const seoSnap = await adminDb.collection("seo_pages").where("published", "==", true).get();
    seoPages = seoSnap.docs.map((d) => {
      const p = d.data();
      const prefix = p.type === "industry" ? "solutions" : "use-cases";
      return {
        url: `${SITE_URL}/${prefix}/${p.slug}`,
        lastModified: p.updatedAt?.toDate?.()?.toISOString?.().split("T")[0] || lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });
  } catch {}

  return [...staticPages, ...blogPosts, ...guides, ...seoPages];
}
