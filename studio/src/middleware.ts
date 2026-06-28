import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { jwtVerify } from 'jose/jwt/verify';
import { createRemoteJWKSet } from 'jose/jwks/remote';
import { buildCspWithNonce } from '@/lib/csp-nonce';

const i18nMiddleware = createMiddleware({
  locales: ['en', 'sn', 'nd', 'pt'],
  defaultLocale: 'en',
  localePrefix: 'never',
});

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJWKS() {
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(new URL(JWKS_URL));
  }
  return jwksCache;
}

const protectedPaths = [
  '/dashboard',
  '/assessment',
  '/toolkit',
  '/budget-calculator',
  '/tenders',
  '/community',
  '/messages',
  '/mentor',
  '/settings',
  '/praz-compliance',
  '/investor-portal',
  '/news',
  '/notifications',
  '/export-assessment',
  '/tax-copilot',
  '/bid-writer',
  '/resource-center',
];

const adminOnlyPaths = [
  '/dashboard/blog',
  '/dashboard/admin',
];

async function verifyAuth(request: NextRequest): Promise<{ authenticated: boolean; role: string | null }> {
  const sessionCookie = request.cookies.get('__session')?.value;
  if (!sessionCookie) {
    console.warn(`[Middleware] No __session cookie for ${request.nextUrl.pathname}`);
    return { authenticated: false, role: null };
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, getJWKS(), {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });

    return {
      authenticated: true,
      role: (payload['role'] as string) || 'sme_owner',
    };
  } catch (err: any) {
    console.warn(`[Middleware] JWT verification failed for ${request.nextUrl.pathname}: ${err?.message || err}`);
    return { authenticated: false, role: null };
  }
}

const API_PROBE_EXTENSIONS = /\.(php\d*|asp|aspx|jsp|jspx|cgi|pl|py|rb|phtml|shtml|htaccess|env|sql|bak|old|swp)$/i;

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block bot probes — applies to ALL paths including API
  if (API_PROBE_EXTENSIONS.test(pathname)) {
    return new NextResponse(null, { status: 404, statusText: 'Not Found' });
  }

  const isApiRoute = pathname.startsWith('/api/');

  if (!isApiRoute) {
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));
    const isAdminOnly = adminOnlyPaths.some(path => pathname.startsWith(path));

    if (isProtected || isAdminOnly) {
      const { authenticated, role } = await verifyAuth(request);
      if (!authenticated) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(signInUrl);
      }
      if (isAdminOnly && role !== 'admin' && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  const response = isApiRoute ? NextResponse.next() : i18nMiddleware(request);

  // Security headers — applied to ALL routes including API
  const cspNonce = crypto.randomUUID();
  response.headers.set('x-nonce', cspNonce);

  // Content-Security-Policy (enforce — 'unsafe-inline' retained for scripts as
  // a transition fallback; remove after monitoring CSP violations for one week)
  const baseCsp = buildCspWithNonce(cspNonce);
  const transitionalCsp = baseCsp.replace(
    "script-src 'self' ",
    "script-src 'self' 'unsafe-inline' ",
  );
  response.headers.set('Content-Security-Policy', transitionalCsp);

  // Auth pages should not appear in search results
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Expose the pathname for dynamic canonical/hreflang in root layout
  response.headers.set('x-pathname', pathname);

  return response;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
