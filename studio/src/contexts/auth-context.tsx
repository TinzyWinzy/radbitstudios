
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
  signUp: (email: string, pass: string) => Promise<any>;
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
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
  deleteAccount: async () => ({ success: false, error: 'Not initialized' }),
});

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries) throw err;
      if (err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions')) {
        await new Promise(r => setTimeout(r, 300 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}

const createUserDocument = async (user: User) => {
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
                usage: freePlan.credits
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  
  const fetchAndSetUser = useCallback(async (authUser: User) => {
    await authUser.getIdToken(true);
    await createUserDocument(authUser);
    const userDocRef = doc(db, 'users', authUser.uid);
    const userDoc = await withRetry(() => getDoc(userDocRef));
    if (userDoc.exists()) {
      setUser({ ...authUser, ...userDoc.data() } as User);
    } else {
      setUser(authUser);
    }
    const idTokenResult = await authUser.getIdTokenResult();
    const customRole = idTokenResult.claims['role'] as UserRole | undefined;
    setRole(customRole ?? 'sme_owner');
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        await fetchAndSetUser(authUser);
        const token = await authUser.getIdToken();
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure;' : ''}`;
      } else {
        setUser(null);
        document.cookie = '__session=; path=/; max-age=0; SameSite=Lax;';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchAndSetUser]);
  
  const refreshUserData = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        setLoading(true);
        await fetchAndSetUser(currentUser);
        setLoading(false);
    }
  },[fetchAndSetUser]);

  const signUp = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newDisplayName = email.split('@')[0] || 'SME User';
    await updateProfile(userCredential.user, { displayName: newDisplayName });
    // Explicitly wait for the full user profile to be ready before proceeding
    await fetchAndSetUser(userCredential.user);
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
    document.cookie = '__session=; path=/; max-age=0; SameSite=Lax;';
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
      document.cookie = '__session=; path=/; max-age=0; SameSite=Lax;';
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
