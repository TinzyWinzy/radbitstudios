import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { jwtVerify } from 'jose/jwt/verify';
import { createRemoteJWKSet } from 'jose/jwks/remote';

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
];

const adminOnlyPaths = [
  '/dashboard/blog',
];

async function verifyAuth(request: NextRequest): Promise<{ authenticated: boolean; role: string | null }> {
  const sessionCookie = request.cookies.get('__session')?.value;
  if (!sessionCookie) return { authenticated: false, role: null };

  try {
    const { payload } = await jwtVerify(sessionCookie, getJWKS(), {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });

    return {
      authenticated: true,
      role: (payload['role'] as string) || 'sme_owner',
    };
  } catch {
    return { authenticated: false, role: null };
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  const response = i18nMiddleware(request);

  // Generate CSP nonce using Web Crypto API (edge-compatible)
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  response.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
