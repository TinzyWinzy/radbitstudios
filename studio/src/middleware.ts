import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const i18nMiddleware = createMiddleware({
  locales: ['en', 'sn', 'nd', 'pt'],
  defaultLocale: 'en',
  localePrefix: 'never',
});

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const JWKS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

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
];

async function verifyAuth(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get('__session')?.value;
  if (!sessionCookie) return false;

  try {
    const { payload } = await jwtVerify(sessionCookie, getJWKS(), {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    return !!payload;
  } catch {
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return i18nMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
