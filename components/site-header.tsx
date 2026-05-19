"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, Bell } from "lucide-react";
import Link from "next/link";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  admin: "destructive",
  editor: "secondary",
  author: "default",
  reader: "outline",
};

export function SiteHeader() {
  const { currentRole } = useRole();
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
        <Button variant="default" size="sm" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
}
