import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';
import * as jose from 'jose';

const adminAuth = getAuth(adminApp);

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

let jwks: jose.JWTVerifyGetKey | null = null;

function getJWKS(): jose.JWTVerifyGetKey {
  if (!jwks) {
    jwks = jose.createRemoteJWKSet(
      new URL('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'),
    );
  }
  return jwks;
}

/**
 * Verify a Firebase ID token using JWKS (edge-compatible, no admin SDK).
 * Use this in middleware or routes that receive Bearer tokens in headers.
 */
export async function verifyIdToken(token: string): Promise<{ uid: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJWKS(), {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    return { uid: payload.sub as string };
  } catch {
    return null;
  }
}

/**
 * Verify the session cookie from a NextRequest and return the decoded user.
 * Returns null if the cookie is missing or invalid.
 */
export async function verifySession(req: NextRequest) {
  const sessionCookie = req.cookies.get('__session')?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(sessionCookie);
    return decoded;
  } catch {
    return null;
  }
}

/**
 * API route wrapper that requires a valid session cookie.
 * Returns 401 if the session is missing or invalid.
 */
export function withAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = await verifySession(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, user.uid);
  };
}

/**
 * API route wrapper that requires a valid session cookie AND a specific role.
 * Returns 401 if session is missing, 403 if role doesn't match.
 */
export function withRole(
  roles: string[],
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = await verifySession(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (user as Record<string, unknown>)['role'] as string || 'sme_owner';
    if (!roles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(req, user.uid);
  };
}
