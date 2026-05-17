import { MetadataRoute } from "next";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitsmehub.co.zw').replace(/\/$/, '');
const IS_PROD = process.env.NODE_ENV === 'production';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/dashboard/blog', '/app/'],
      },
      // Separate rule block for Googlebot — avoids key collision
      ...(IS_PROD
        ? [{
            userAgent: 'Googlebot',
            allow: ['/', '/blog', '/resources', '/assessment', '/toolkit', '/tenders', '/community', '/mentor'],
          }]
        : []),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
