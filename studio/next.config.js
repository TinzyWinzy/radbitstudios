const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.firebaseio.com https://apis.google.com https://accounts.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://placehold.co https://picsum.photos https://*.googleapis.com https://*.gstatic.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://*.google.com https://googleads.g.doubleclick.net https://*.googleusercontent.com;
  font-src 'self' data:;
  connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com wss://*.firebaseio.com https://pagead2.googlesyndication.com https://apis.google.com https://accounts.google.com https://ep1.adtrafficquality.google https://googleads.g.doubleclick.net https://*.google.com https://*.doubleclick.net https://*.googleusercontent.com;
  frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com https://googleads.g.doubleclick.net https://*.doubleclick.net;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
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
    ];
  },
};

module.exports = withNextIntl(nextConfig);
