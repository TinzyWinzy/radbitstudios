
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<any>;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
});

const createUserDocument = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

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
  
  const fetchAndSetUser = useCallback(async (authUser: User) => {
    await createUserDocument(authUser);
    const userDocRef = doc(db, 'users', authUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      setUser({ ...authUser, ...userDoc.data() } as User);
    } else {
      setUser(authUser);
    }
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

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
