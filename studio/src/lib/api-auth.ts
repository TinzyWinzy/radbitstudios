import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/firebase-admin';

const adminAuth = getAuth(adminApp);

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
