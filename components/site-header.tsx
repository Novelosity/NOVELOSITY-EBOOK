"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, Bell, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  admin: "destructive",
  editor: "secondary",
  author: "default",
  reader: "outline",
};

export function SiteHeader() {
  const { currentRole } = useRole();
  const { user, userProfile, signOut, isLoading } = useAuth();

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex-1 flex items-center gap-2">
        <span className="font-headline text-lg hidden md:block text-primary">Novelosity</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={roleBadgeVariant[currentRole] ?? "outline"} className="capitalize hidden sm:flex">
          {currentRole}
        </Badge>
        <Button variant="ghost" size="icon" aria-label="Search">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        {!isLoading && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.photoURL ?? ''} alt={userProfile?.displayName ?? 'User'} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userProfile?.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" /> My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          !isLoading && (
            <Button variant="default" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )
        )}
      </div>
    </header>
  );
}
