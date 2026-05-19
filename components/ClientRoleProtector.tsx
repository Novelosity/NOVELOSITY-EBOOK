"use client";

import { useEffect } from 'react';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ClientRoleProtectorProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  pageTitle?: string;
}

export default function ClientRoleProtector({
  children,
  allowedRoles,
  pageTitle,
}: ClientRoleProtectorProps) {
  const { currentRole, isLoading } = useRole();

  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} | Novelosity`;
    }
  }, [pageTitle]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!allowedRoles.includes(currentRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-headline mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don&apos;t have permission to view this page. This area requires the{' '}
          <span className="font-semibold capitalize">{allowedRoles.join(' or ')}</span> role.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/profile">My Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
