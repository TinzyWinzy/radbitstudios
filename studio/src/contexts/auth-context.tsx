
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import {
  onAuthStateChanged,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { subscriptionPlans, normalizePlanName } from '@/lib/subscriptions';
import type { UserRole } from '@/services/permissions';
import type { AppUser } from '@/types/user';
import { withRetry } from '@/lib/retry';
import { welcomeEmail, sendEmail } from '@/services/email-service';
import { getCachedUser, setCachedUser, invalidateUserCache } from '@/services/user-cache';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  role: UserRole | null;
  signUp: (email: string, pass: string, extraData?: Record<string, unknown>) => Promise<UserCredential>;
  signIn: (email: string, pass: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  signUp: async () => { throw new Error('AuthContext not initialized'); },
  signIn: async () => { throw new Error('AuthContext not initialized'); },
  signInWithGoogle: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => {},
  refreshUserData: async () => {},
  deleteAccount: async () => ({ success: false, error: 'Not initialized' }),
});

const createUserDocument = async (user: User, extraData?: Record<string, unknown>) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await withRetry(() => getDoc(userDocRef));

    if (!userDocSnap.exists()) {
        const { uid, email, displayName, photoURL } = user;
        const createdAt = serverTimestamp();

        // For email sign-up, displayName might be null initially.
        // We create a fallback from the email.
        const newDisplayName = displayName || email?.split('@')[0] || 'SME User';
        
        // New users start on the Free plan
        const freePlan = subscriptionPlans.find(p => p.name === 'Free');
        if (!freePlan) throw new Error("Free subscription plan not found.");

        try {
            await setDoc(userDocRef, {
                uid,
                email,
                displayName: newDisplayName,
                photoURL: photoURL || `https://placehold.co/100x100.png`,
                createdAt,
                businessName: '',
                industry: '',
                businessDescription: '',
                plan: freePlan.name,
                usage: freePlan.credits,
                phone: '',
                whatsappOptIn: false,
                ...extraData,
            });

             // If the auth user's display name is null, update it
            if (!displayName) {
                await updateProfile(user, { displayName: newDisplayName });
            }

        } catch (error) {
            console.error("Error creating user document:", error);
        }
    }
}


const TOKEN_LIFETIME_MS = 60 * 60 * 1000; // Firebase ID token lifetime

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const mountedRef = useRef(true);
  const authEventIdRef = useRef(0);
  const welcomeSentRef = useRef(false);
  const tokenExpiryRef = useRef<number>(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchAndSetUser = useCallback(async (authUser: User, extraData?: Record<string, unknown>) => {
    if (!extraData) {
      const cached = await getCachedUser(authUser.uid);
      if (cached) {
        if (!mountedRef.current) return;
        const mergedUser = { ...authUser, ...cached } as AppUser;
        setUser(mergedUser);
        const docRole = cached.role as UserRole | undefined;
        if (docRole && ['sme_owner', 'sme_staff', 'admin', 'super_admin'].includes(docRole)) {
          setRole(docRole);
        } else {
          const idTokenResult = await authUser.getIdTokenResult();
          if (!mountedRef.current) return;
          setRole((idTokenResult.claims['role'] as UserRole) ?? 'sme_owner');
        }
        return;
      }
    }

    await createUserDocument(authUser, extraData);
    const userDocRef = doc(db, 'users', authUser.uid);
    const userDoc = await withRetry(() => getDoc(userDocRef));
    if (!mountedRef.current) return;
    if (userDoc.exists()) {
      const rawData = userDoc.data();
      const mergedUser = { ...authUser, ...rawData, plan: normalizePlanName(rawData.plan as string | undefined) } as AppUser;
      setUser(mergedUser);
      const docRole = rawData.role as UserRole | undefined;
      if (docRole && ['sme_owner', 'sme_staff', 'admin', 'super_admin'].includes(docRole)) {
        setRole(docRole);
      } else {
        const idTokenResult = await authUser.getIdTokenResult();
        if (!mountedRef.current) return;
        setRole((idTokenResult.claims['role'] as UserRole) ?? 'sme_owner');
      }
      const cacheData: Record<string, unknown> = {};
      for (const key in rawData) {
        if (Object.prototype.hasOwnProperty.call(rawData, key)) {
          const val = rawData[key];
          if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
            cacheData[key] = (val as { toDate: () => Date }).toDate().toISOString();
          } else {
            cacheData[key] = val;
          }
        }
      }
      setCachedUser(authUser.uid, cacheData);
    } else {
      setUser(authUser as AppUser);
      const idTokenResult = await authUser.getIdTokenResult();
      if (!mountedRef.current) return;
      setRole((idTokenResult.claims['role'] as UserRole) ?? 'sme_owner');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      const eventId = ++authEventIdRef.current;

      // CRITICAL: Set session cookie IMMEDIATELY on auth state change,
      // before any async work. This prevents the middleware from rejecting
      // requests that arrive while fetchAndSetUser is still running.
      if (authUser) {
        authUser.getIdToken().then(token => {
          fetch('/api/auth/refresh-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
          }).then(res => {
            if (res.ok) tokenExpiryRef.current = Date.now() + TOKEN_LIFETIME_MS;
          }).catch(() => {});
        }).catch(() => {});
      } else {
        setUser(null);
        setRole(null);
        fetch('/api/auth/refresh-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: '', expiresIn: 0 }),
        }).catch(() => {});
      }

      const handleAuth = async () => {
        if (authUser) {
          await fetchAndSetUser(authUser);
          if (eventId !== authEventIdRef.current) return;

          if (!welcomeSentRef.current) {
            const userDocRef = doc(db, 'users', authUser.uid);
            const userDoc = await getDoc(userDocRef);
            const createdAt = userDoc.data()?.createdAt?.toDate?.();
            if (createdAt && Date.now() - createdAt.getTime() < 120000) {
              welcomeSentRef.current = true;
              const name = authUser.displayName || authUser.email?.split('@')[0] || 'Entrepreneur';
              const { subject, html } = welcomeEmail(name);
              sendEmail(authUser.email || '', subject, html).catch(() => {});
            }
          }
        }
        if (eventId !== authEventIdRef.current) return;
        setLoading(false);
      };

      handleAuth().catch((err) => {
        console.error('Auth state change handler error:', err);
        if (eventId === authEventIdRef.current) {
          setLoading(false);
        }
      });
    });

    const refreshInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const token = await currentUser.getIdToken(false);
        const res = await fetch('/api/auth/refresh-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        });
        if (res.ok) {
          tokenExpiryRef.current = Date.now() + TOKEN_LIFETIME_MS;
        } else {
          // Token rejected — force refresh
          const newToken = await currentUser.getIdToken(true);
          const retryRes = await fetch('/api/auth/refresh-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: newToken }),
          });
          if (retryRes.ok) tokenExpiryRef.current = Date.now() + TOKEN_LIFETIME_MS;
        }
      } catch {
        // Network error — will retry on next interval
      }
    }, 15 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [fetchAndSetUser]);
  
  const refreshUserData = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        await fetchAndSetUser(currentUser);
    }
  },[fetchAndSetUser]);

  const signUp = useCallback(async (email: string, pass: string, extraData?: Record<string, unknown>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newDisplayName = email.split('@')[0] || 'SME User';
    await updateProfile(userCredential.user, { displayName: newDisplayName });
    await fetchAndSetUser(userCredential.user, extraData);
    return userCredential;
  }, [fetchAndSetUser]);

  const signIn = useCallback((email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }, []);

  const signInWithGoogle = useCallback(() => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }, []);

  const logout = useCallback(async () => {
    const currentUid = auth.currentUser?.uid;
    try {
      await fetch('/api/auth/refresh-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: '', expiresIn: 0 }),
      });
    } catch {
      // Best effort cookie clear
    }
    await signOut(auth);
    if (currentUid) {
      invalidateUserCache(currentUid);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return { success: false, error: 'No user signed in.' };

      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to delete account.' };

      await currentUser.delete();
      await fetch('/api/auth/refresh-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: '', expiresIn: 0 }),
      });
      setUser(null);

      return { success: true };
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      if (err?.code === 'auth/requires-recent-login') {
        return { success: false, error: 'Please sign out and sign back in, then try again. This is a security requirement.' };
      }
      return { success: false, error: (error instanceof Error ? error.message : String(error)) || '' };
    }
  }, [fetchAndSetUser]);

  const value = useMemo(() => ({
    user,
    loading,
    role,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    refreshUserData,
    deleteAccount,
  }), [user, loading, role, signUp, signIn, signInWithGoogle, logout, refreshUserData, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
