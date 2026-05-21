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
          '/export-assessment',
          '/budget-calculator',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/blog',
          '/resources',
          '/assessment',
          '/toolkit',
          '/tenders',
          '/community',
          '/mentor',
          '/sign-in',
          '/sign-up',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
