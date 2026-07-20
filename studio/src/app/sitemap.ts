import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { CONTENT_CLUSTERS } from "@/data/content-clusters";
import { INDUSTRY_PAGES, SERVICE_PAGES } from "@/data/commercial-content";
import { DIAGNOSTIC_TOOLS } from "@/data/diagnostic-tools";

export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastMod = new Date().toISOString().split("T")[0];

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${SITE_URL}/resources`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/resources/faq`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${SITE_URL}/insights`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.9 },
    ...CONTENT_CLUSTERS.map(cluster => ({ url: `${SITE_URL}/insights/${cluster.slug}`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.85 })),
    { url: `${SITE_URL}/services`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/work`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/pilot`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${SITE_URL}/solutions`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/use-cases`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/pricing`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/founders`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/research/sentinel-zero`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.65 },
    { url: `${SITE_URL}/contact`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${SITE_URL}/consultancy`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/partners`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${SITE_URL}/zimra-fiscal-device-registration`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${SITE_URL}/compliant-receipts`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/vat-threshold-alerts`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/offline-mode`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/penalty-protection`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/tender-compliance-bridge`, lastModified: lastMod, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/diaspora`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${SITE_URL}/diaspora/invest`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${SITE_URL}/diaspora/start-business`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${SITE_URL}/diaspora-matchmaking`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/events/zimbabwe-business-expo-2026`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/guides/zimra-tax-calendar-2026`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.7 },
    ...SERVICE_PAGES.map(page => ({ url: `${SITE_URL}/services/${page.slug}`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.85 })),
    ...INDUSTRY_PAGES.map(page => ({ url: `${SITE_URL}/solutions/${page.slug}`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...DIAGNOSTIC_TOOLS.map(tool => ({ url: `${SITE_URL}/resources/tools/${tool.slug}`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.75 })),
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
  } catch (err) {
    console.error('[Sitemap] Failed to fetch blog posts:', (err as Error)?.message);
  }

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
  } catch (err) {
    console.error('[Sitemap] Failed to fetch guides:', (err as Error)?.message);
  }

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
  } catch (err) {
    console.error('[Sitemap] Failed to fetch SEO pages:', (err as Error)?.message);
  }

  let threatAssessments: MetadataRoute.Sitemap = [];
  try {
    const taSnap = await adminDb.collection("threat_assessments").where("published", "==", true).get();
    threatAssessments = taSnap.docs.map((d) => {
      const ta = d.data();
      const holon = ta.holon as { holon_type?: string } | undefined;
      const isIntercept = holon?.holon_type === "intercept_page";
      return {
        url: `${SITE_URL}/${isIntercept ? "intelligence" : "threats"}/${d.id}`,
        lastModified: ta.generatedAt?.toDate?.()?.toISOString?.().split("T")[0] || lastMod,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });
  } catch (err) {
    console.error('[Sitemap] Failed to fetch threat assessments:', (err as Error)?.message);
  }

  return [...staticPages, ...blogPosts, ...guides, ...seoPages, ...threatAssessments];
}
