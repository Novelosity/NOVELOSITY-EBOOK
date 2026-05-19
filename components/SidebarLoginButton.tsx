"use client";

import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function SidebarLoginButton() {
  const { user, signOut, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        onClick={signOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      asChild
    >
      <Link href="/login">
        <LogIn className="mr-2 h-4 w-4" />
        Login / Register
      </Link>
    </Button>
  );
}
