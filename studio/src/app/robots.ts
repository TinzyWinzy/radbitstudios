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
          '/compliant-receipts',
          '/consultancy',
          '/contact',
          '/diaspora',
          '/diaspora-matchmaking',
          '/events/',
          '/founders',
          '/intelligence',
          '/offline-mode',
          '/partners',
          '/penalty-protection',
          '/pricing',
          '/privacy',
          '/resources',
          '/solutions',
          '/tender-compliance-bridge',
          '/terms',
          '/threats',
          '/use-cases',
          '/vat-threshold-alerts',
          '/zimra-fiscal-device-registration',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
