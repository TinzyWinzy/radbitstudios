
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { subscriptionPlans } from '@/lib/subscriptions';
import type { UserRole } from '@/services/permissions';
import type { AppUser } from '@/types/user';
import { withRetry } from '@/lib/retry';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  role: UserRole | null;
  signUp: (email: string, pass: string, extraData?: Record<string, unknown>) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<any>;
  refreshUserData: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  signUp: async (_email: string, _pass: string, _extraData?: Record<string, unknown>) => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
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


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  
  const fetchAndSetUser = useCallback(async (authUser: User, extraData?: Record<string, unknown>) => {
    await createUserDocument(authUser, extraData);
    const userDocRef = doc(db, 'users', authUser.uid);
    const userDoc = await withRetry(() => getDoc(userDocRef));
    if (userDoc.exists()) {
      const mergedUser = { ...authUser, ...userDoc.data() } as AppUser;
      setUser(mergedUser);
      const docRole = userDoc.data().role as UserRole | undefined;
      if (docRole && ['sme_owner', 'sme_staff', 'admin', 'super_admin'].includes(docRole)) {
        setRole(docRole);
      } else {
        const idTokenResult = await authUser.getIdTokenResult();
        setRole((idTokenResult.claims['role'] as UserRole) ?? 'sme_owner');
      }
    } else {
      setUser(authUser as AppUser);
      const idTokenResult = await authUser.getIdTokenResult();
      setRole((idTokenResult.claims['role'] as UserRole) ?? 'sme_owner');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        await fetchAndSetUser(authUser);
        await fetch('/api/auth/refresh-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: await authUser.getIdToken() }),
        });
      } else {
        setUser(null);
        await fetch('/api/auth/refresh-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: '', expiresIn: 0 }),
        });
      }
      setLoading(false);
    });

    const refreshInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(false);
        const res = await fetch('/api/auth/refresh-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        });
        if (!res.ok) {
          const newToken = await currentUser.getIdToken(true);
          await fetch('/api/auth/refresh-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: newToken }),
          });
        }
      }
    }, 30 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [fetchAndSetUser]);
  
  const refreshUserData = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        setLoading(true);
        await fetchAndSetUser(currentUser);
        setLoading(false);
    }
  },[fetchAndSetUser]);

  const signUp = async (email: string, pass: string, extraData?: Record<string, unknown>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newDisplayName = email.split('@')[0] || 'SME User';
    await updateProfile(userCredential.user, { displayName: newDisplayName });
    // Explicitly wait for the full user profile to be ready before proceeding
    await fetchAndSetUser(userCredential.user, extraData);
    return userCredential;
  };

  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    fetch('/api/auth/refresh-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: '', expiresIn: 0 }),
    });
    return signOut(auth);
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
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
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        return { success: false, error: 'Please sign out and sign back in, then try again. This is a security requirement.' };
      }
      return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
  };

  const value = {
    user,
    loading,
    role,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    refreshUserData,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
