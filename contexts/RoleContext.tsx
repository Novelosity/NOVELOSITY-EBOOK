"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'reader' | 'author' | 'editor' | 'admin';

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<UserRole>('reader');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem('novelosity_role') as UserRole | null;
    if (savedRole && ['reader', 'author', 'editor', 'admin'].includes(savedRole)) {
      setCurrentRoleState(savedRole);
    }
    setIsLoading(false);
  }, []);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem('novelosity_role', role);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
