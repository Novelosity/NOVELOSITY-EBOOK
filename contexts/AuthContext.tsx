"use client";

// Auth is handled entirely by Clerk.
// This context provides the extended user profile (role, coins) from Neon.

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { getOrCreateProfile, updateUserRole, updateUserCoins, UserProfile, UserRole } from '@/actions/users';

interface AuthContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  setRole: (role: UserRole) => Promise<void>;
  addCoins: (delta: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await getOrCreateProfile();
      setUserProfile(profile);
    } catch {
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    setIsLoading(true);
    refreshProfile();
  }, [isLoaded, refreshProfile]);

  const setRole = async (role: UserRole) => {
    await updateUserRole(role);
    setUserProfile((prev) => (prev ? { ...prev, role } : null));
  };

  const addCoins = async (delta: number) => {
    const newBalance = await updateUserCoins(delta);
    setUserProfile((prev) => (prev ? { ...prev, coins: newBalance } : null));
  };

  return (
    <AuthContext.Provider value={{ userProfile, isLoading, setRole, addCoins, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
