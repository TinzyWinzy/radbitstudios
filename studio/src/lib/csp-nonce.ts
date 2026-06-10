/* ── CSP Nonce Utility ──────────────────────────────────────────────────
   Generates a per-request nonce for Content Security Policy.
   Used to replace 'unsafe-inline' in script-src.
   ─────────────────────────────────────────────────────────────────── */

/**
 * Generate a cryptographically random nonce for CSP.
 * Returns a base64-encoded string suitable for use in headers and script tags.
 * Uses Web Crypto API for Edge Runtime compatibility.
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Build a CSP header string with nonce-based script-src.
 * Replaces 'unsafe-inline' with 'nonce-<nonce>' for scripts.
 */
export function buildCspWithNonce(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';
  const reportUri = process.env.SENTRY_DSN
    ? `https://sentry.io/api/security-report/?sentry_key=${process.env.SENTRY_DSN.split('@')[0]?.split('//').pop()}`
    : '';

  return `
    default-src 'self';
    script-src 'self' ${isDev ? "'unsafe-eval'" : ''} 'nonce-${nonce}' 'strict-dynamic' https://pagead2.googlesyndication.com https://*.firebaseio.com https://apis.google.com https://accounts.google.com https://js.stripe.com https://hooks.stripe.com;
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
}
