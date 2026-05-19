"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type UserRole = 'reader' | 'author' | 'editor' | 'admin';

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => Promise<void>;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { userProfile, isLoading: authLoading, setRole } = useAuth();

  const currentRole: UserRole = (userProfile?.role as UserRole) ?? 'reader';
  const isLoading = authLoading;

  const setCurrentRole = async (role: UserRole) => {
    await setRole(role);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextType {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
