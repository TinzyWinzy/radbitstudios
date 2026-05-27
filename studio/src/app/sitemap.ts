import { MetadataRoute } from "next";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { industries, useCases } from "@/data/seo-pages";

const F =
  (process.env.FRONTEND_URL || "https://radbitstudios.co.zw").replace(/\/$/, "");

async function getPublishedBlogSlugs(): Promise<string[]> {
  try {
    if (!getApps().length) {
      const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (key) initializeApp({ credential: cert(JSON.parse(key)) });
      else initializeApp();
    }
    const db = getFirestore();
    const snap = await db
      .collection("blog_posts")
      .where("published", "==", true)
      .get();
    return snap.docs.map((d) => d.data().slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedBlogSlugs();

  const blogEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${F}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const industryEntries: MetadataRoute.Sitemap = industries.map((page) => ({
    url: `${F}/solutions/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const useCaseEntries: MetadataRoute.Sitemap = useCases.map((page) => ({
    url: `${F}/use-cases/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: `${F}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${F}/sign-in`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${F}/sign-up`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${F}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.2 },
    { url: `${F}/assessment`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${F}/ai-toolkit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 },
    { url: `${F}/tenders`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${F}/community`, lastModified: new Date(), changeFrequency: "daily", priority: 0.4 },
    { url: `${F}/mentor`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 },
    { url: `${F}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...blogEntries,
    { url: `${F}/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${F}/resources/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${F}/resources/guides/register-business-zimbabwe`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${F}/resources/guides/zimra-tax-guide-smes`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${F}/resources/guides/sadc-export-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${F}/resources/guides/ecocash-business-vs-personal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/resources/guides/load-shedding-solutions-smes`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/resources/guides/zim-business-planning`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${F}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${F}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${F}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${F}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${F}/resources/tools/vat-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/resources/tools/business-name-generator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${F}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${F}/praz-compliance`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${F}/solutions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/use-cases`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/solutions/logistics-pharmacies`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/solutions/agri-tech-manufacturing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/solutions/hospitality-studios`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...industryEntries,
    ...useCaseEntries,
    { url: `${F}/partners/techhub-harare`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${F}/partners/impact-hub`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${F}/partners/moto-republik`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${F}/events/zimbabwe-business-expo-2026`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${F}/diaspora-matchmaking`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];
}
