const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');
const { withSentryConfig } = require('@sentry/nextjs');

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')()
  : (x) => x;

const reportUri = process.env.SENTRY_DSN
  ? `https://sentry.io/api/security-report/?sentry_key=${process.env.SENTRY_DSN.split('@')[0]?.split('//').pop()}`
  : '';

const isDev = process.env.NODE_ENV === 'development';
const csp = `
  default-src 'self';
  script-src 'self' ${isDev ? "'unsafe-eval'" : ''} 'unsafe-inline' https://pagead2.googlesyndication.com https://*.firebaseio.com https://apis.google.com https://accounts.google.com https://js.stripe.com https://hooks.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://placehold.co https://picsum.photos https://*.googleapis.com https://*.gstatic.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://*.google.com https://googleads.g.doubleclick.net https://*.googleusercontent.com https://*.imgur.com https://*.unsplash.com;
  font-src 'self' data:;
  connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com wss://*.firebaseio.com https://pagead2.googlesyndication.com https://apis.google.com https://accounts.google.com https://ep1.adtrafficquality.google https://googleads.g.doubleclick.net https://*.google.com https://*.doubleclick.net https://*.googleusercontent.com https://api.stripe.com https://www.paynow.co.zw https://hooks.stripe.com https://generativelanguage.googleapis.com;
  frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.firebaseapp.com https://accounts.google.com https://apis.google.com https://googleads.g.doubleclick.net https://*.doubleclick.net;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  ${reportUri ? `report-uri ${reportUri};` : ''}
  ${reportUri ? `report-to csp-endpoint;` : ''}
`.replace(/\s{2,}/g, ' ').trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      {
        source: '/:path((?!api).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

const sentryOptions = {
  org: process.env.SENTRY_ORG || "radbit-studios",
  project: process.env.SENTRY_PROJECT || "sme-hub",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  telemetry: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;
    }
    return config;
  },
};

module.exports = withBundleAnalyzer(withSentryConfig(withNextIntl(nextConfig), sentryOptions));
