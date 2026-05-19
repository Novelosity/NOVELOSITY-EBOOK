"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export type UserRole = 'reader' | 'author' | 'editor' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  coins: number;
  joinedAt: unknown;
  bio?: string;
  authorName?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  updateCoins: (delta: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    } catch {
      return null;
    }
  };

  const createUserProfile = async (
    firebaseUser: User,
    role: UserRole = 'reader',
    displayName?: string
  ): Promise<UserProfile> => {
    const profile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: displayName ?? firebaseUser.displayName ?? 'Reader',
      photoURL: firebaseUser.photoURL ?? '',
      role,
      coins: 250,
      joinedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
    return profile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchUserProfile(result.user.uid);
    setUserProfile(profile);
    router.push('/');
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole = 'reader'
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    const profile = await createUserProfile(result.user, role, displayName);
    setUserProfile(profile);
    router.push(role === 'author' ? '/author-dashboard' : '/');
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
    router.push('/login');
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const existing = await fetchUserProfile(result.user.uid);
    if (!existing) {
      const profile = await createUserProfile(result.user, 'reader');
      setUserProfile(profile);
    } else {
      setUserProfile(existing);
    }
    router.push('/');
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserRole = async (role: UserRole) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });
    setUserProfile((prev) => (prev ? { ...prev, role } : null));
  };

  const updateCoins = async (delta: number) => {
    if (!user || !userProfile) return;
    const newBalance = Math.max(0, userProfile.coins + delta);
    await setDoc(doc(db, 'users', user.uid), { coins: newBalance }, { merge: true });
    setUserProfile((prev) => (prev ? { ...prev, coins: newBalance } : null));
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchUserProfile(user.uid);
    setUserProfile(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetPassword,
        updateUserRole,
        updateCoins,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
