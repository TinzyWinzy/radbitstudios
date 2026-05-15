import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/assessment", "/toolkit", "/budget-calculator", "/tenders", "/community", "/messages", "/mentor", "/settings"],
    },
    sitemap: "https://radbit-sme-hub-ck05x.web.app/sitemap.xml",
  };
}
