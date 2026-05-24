"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Home,
  BookOpen,
  Users,
  User,
  Settings,
  MessageSquare,
  LayoutDashboard,
  FilePlus,
  Wand2,
  ShieldCheck,
  UserCog,
  ClipboardList,
  Edit3,
  BarChart2,
} from "lucide-react";

const readerLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: BookOpen },
  { href: "/authors", label: "Authors", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

const authorLinks = [
  { href: "/author-dashboard", label: "Author Dashboard", icon: LayoutDashboard },
  { href: "/author-dashboard/statistics", label: "Statistics", icon: BarChart2 },
  { href: "/author/create-novel", label: "Create Novel", icon: FilePlus },
  { href: "/tools/chapter-title-generator", label: "AI Title Generator", icon: Wand2 },
];

const editorLinks = [
  { href: "/editor-portal", label: "Editor Portal", icon: Edit3 },
  { href: "/editorial-dashboard", label: "Submissions", icon: ClipboardList },
  { href: "/author-communication", label: "Author Communication", icon: MessageSquare },
  { href: "/content-moderation", label: "Content Moderation", icon: ShieldCheck },
];

const adminLinks = [
  { href: "/admin-portal", label: "Admin Portal", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: UserCog },
  { href: "/content-moderation", label: "Content Moderation", icon: ClipboardList },
];

export function NavMenu() {
  const pathname = usePathname();
  const { currentRole } = useRole();

  const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={pathname === href}
        tooltip={label}
      >
        <Link href={href}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarMenu>
          {readerLinks.map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {(currentRole === "author" || currentRole === "admin") && (
        <SidebarGroup>
          <SidebarGroupLabel>Author</SidebarGroupLabel>
          <SidebarMenu>
            {authorLinks.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}

      {(currentRole === "editor" || currentRole === "admin") && (
        <SidebarGroup>
          <SidebarGroupLabel>Editorial</SidebarGroupLabel>
          <SidebarMenu>
            {editorLinks.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}

      {currentRole === "admin" && (
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarMenu>
            {adminLinks.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  );
}
