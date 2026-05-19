"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type UserRole = 'reader' | 'author' | 'editor' | 'admin';

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const VALID_ROLES: UserRole[] = ['reader', 'author', 'editor', 'admin'];

export function RoleProvider({ children }: { children: ReactNode }) {
  const { userProfile, isLoading: authLoading, updateUserRole } = useAuth();
  const [localRole, setLocalRole] = useState<UserRole>('reader');
  const [isLoading, setIsLoading] = useState(true);

  // Sync local role with authenticated user's Firestore role
  useEffect(() => {
    if (!authLoading) {
      if (userProfile?.role && VALID_ROLES.includes(userProfile.role)) {
        setLocalRole(userProfile.role);
      } else {
        // Unauthenticated fallback: check localStorage
        try {
          const saved = localStorage.getItem('novelosity_role') as UserRole | null;
          if (saved && VALID_ROLES.includes(saved)) setLocalRole(saved);
        } catch {
          // localStorage not available
        }
      }
      setIsLoading(false);
    }
  }, [userProfile, authLoading]);

  const setCurrentRole = (role: UserRole) => {
    setLocalRole(role);
    try {
      localStorage.setItem('novelosity_role', role);
    } catch {
      // ignore
    }
    // Persist to Firestore if authenticated
    if (userProfile) {
      updateUserRole(role);
    }
  };

  // Always prefer Firestore role when authenticated
  const currentRole: UserRole = userProfile?.role ?? localRole;

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextType {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
}
