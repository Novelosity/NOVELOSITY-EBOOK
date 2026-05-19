"use client";

import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function SidebarLoginButton() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        onClick={() => signOut(() => router.push('/login'))}
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
