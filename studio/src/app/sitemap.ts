import { MetadataRoute } from "next";

const F =
  (process.env.FRONTEND_URL || "https://radbitsmehub.co.zw").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Home ───────────────────────────────────────────────────────────
    { url: `${F}/`,                          lastModified: new Date(), changeFrequency: "daily",   priority: 1    },

    // ── Auth ───────────────────────────────────────────────────────────
    { url: `${F}/sign-in`,                   lastModified: new Date(), changeFrequency: "monthly", priority: 0.3  },
    { url: `${F}/sign-up`,                   lastModified: new Date(), changeFrequency: "monthly", priority: 0.5  },

    // ── Core app ───────────────────────────────────────────────────────
    { url: `${F}/dashboard`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.4  },
    { url: `${F}/assessment`,                lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7  },
    { url: `${F}/ai-toolkit`,                lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6  },
    { url: `${F}/budget-calculator`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5  },
    { url: `${F}/tenders`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.7  },
    { url: `${F}/community`,                 lastModified: new Date(), changeFrequency: "daily",   priority: 0.6  },
    { url: `${F}/mentor`,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5  },
    { url: `${F}/settings`,                  lastModified: new Date(), changeFrequency: "monthly", priority: 0.3  },
    { url: `${F}/messages`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.3  },

    // ── Content hub (public, ad-revenue pages) ─────────────────────────
    { url: `${F}/blog`,                      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7  },
    { url: `${F}/blog/feed.xml`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.3  },

    // ── Resources ───────────────────────────────────────────────────────
    { url: `${F}/resources`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${F}/resources/faq`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.6  },

    // ── Pillar guides (highest-value SEO pages) ─────────────────────────
    { url: `${F}/resources/guides/register-business-zimbabwe`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${F}/resources/guides/zimra-tax-guide-smes`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${F}/resources/guides/sadc-export-guide`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${F}/resources/guides/ecocash-business-vs-personal`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/resources/guides/load-shedding-solutions-smes`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/resources/guides/zim-business-planning`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },

    // ── Privacy & Terms ───────────────────────────────────────────────────
    { url: `${F}/privacy-policy`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.3  },
    { url: `${F}/terms-and-conditions`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.3  },
    { url: `${F}/cookie-policy`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.3  },

    // ── Free tools ───────────────────────────────────────────────────────
    { url: `${F}/resources/tools/vat-calculator`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${F}/resources/tools/business-name-generator`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
