import { MetadataRoute } from "next";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/api/',
          '/_next/',
          '/dashboard',
          '/settings',
          '/messages',
          '/notifications',
          '/news',
          '/export-assessment',
          '/budget-calculator',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about',
          '/blog',
          '/contact',
          '/diaspora',
          '/founders',
          '/intelligence',
          '/partners',
          '/pricing',
          '/privacy',
          '/resources',
          '/solutions',
          '/terms',
          '/threats',
          '/use-cases',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
