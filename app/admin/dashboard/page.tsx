
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, ShieldCheck, BookCopy, Tag, Filter, Megaphone, Star, LineChart, DollarSign, 
  Settings2, AlertTriangle, Scale, FileText, Banknote, Coins, ListChecks, UserCog, GitFork, Ticket, Eye
} from "lucide-react";
import Link from "next/link";
import ClientRoleProtector from "@/components/ClientRoleProtector";

const adminSections = [
  { 
    title: "User Management", 
    description: "Manage users, roles, permissions, and ban users if necessary.", 
    icon: UserCog, 
    link: "#users",
    actions: [{ label: "View Users", href: "/admin/users" }, { label: "Ban User", href: "#"}] 
  },
  { 
    title: "Book & Content Management", 
    description: "Approve/disapprove novels, manage categories, tags, and the overall content pipeline.", 
    icon: BookCopy, 
    link: "#books",
    actions: [{ label: "Manage Books", href: "#" }, { label: "Manage Categories & Tags", href: "#" }]
  },
  { 
    title: "Promotions & Features", 
    description: "Run promotional campaigns, manage discount codes, and feature books on the platform.", 
    icon: Megaphone, 
    link: "#promotions",
    actions: [{ label: "Create Promotion", href: "#" }, { label: "Manage Discount Codes", href: "#" }, { label: "Feature Book", href: "#" }]
  },
  { 
    title: "Analytics & Reports", 
    description: "View app analytics: DAU, retention, revenue, and other key metrics.", 
    icon: LineChart, 
    link: "#analytics",
    actions: [{ label: "View Dashboard", href: "#" }]
  },
  { 
    title: "Financial Overview", 
    description: "Manage payments, subscriptions, author payouts, and view transaction logs.", 
    icon: Banknote, 
    link: "#payments",
    actions: [
      { label: "View Transactions", href: "#" }, 
      { label: "Manage Subscriptions", href: "#" },
      { label: "Process Author Payouts", href: "#" }
    ]
  },
  { 
    title: "Site Settings & Configuration", 
    description: "Manage site-wide settings, integrations, and platform configurations.", 
    icon: Settings2, 
    link: "#site-settings",
    actions: [{ label: "Edit Settings", href: "#" }]
  },
  { 
    title: "Moderation & Support", 
    description: "Handle user support tickets, advanced content moderation, and legal notices.", 
    icon: ListChecks, 
    link: "#support-moderation",
    actions: [{ label: "View Tickets", href: "#" }, { label: "Moderation Queue", href: "/content-moderation" }, { label: "Legal Notices", href: "#" }]
  },
  { 
    title: "System Health & Logs", 
    description: "Access system logs, monitor application health, manage flagged content, and view audit trails.", 
    icon: GitFork, 
    link: "#system-logs",
    actions: [
      { label: "View System Logs", href: "#" }, 
      { label: "View Audit Logs", href: "#" },
      { label: "Manage Flagged Content", href: "#" }, 
      { label: "System Status", href: "#" }
    ]
  },
];

export default function AdminDashboardPage() {
  return (
    <ClientRoleProtector allowedRoles={["admin"]} pageTitle="Admin Dashboard">
      <AdminDashboardContent />
    </ClientRoleProtector>
  );
}

function AdminDashboardContent() {
  useEffect(() => {
    // Document title is now set by ClientRoleProtector if pageTitle prop is passed
  }, []);

  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <ShieldCheck className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-primary mb-4" />
        <h1 className="text-3xl sm:text-4xl font-headline mb-2">Admin Dashboard</h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Oversee and manage all aspects of the Novelosity platform.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Card key={section.title} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <section.icon className="h-7 w-7 text-primary" />
                <CardTitle className="font-headline text-xl">{section.title}</CardTitle>
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Can add quick stats or summaries here if needed */}
            </CardContent>
            <CardContent className="border-t pt-4">
              <div className="flex flex-wrap gap-2">
                {section.actions.map(action => (
                  <Button 
                    key={action.label}
                    variant="outline" 
                    size="sm" 
                    asChild={action.href.startsWith('/')}
                    onClick={() => action.href === "#" && alert(`${action.label} clicked (UI Placeholder)`)}
                  >
                    {action.href.startsWith('/') ? <Link href={action.href}>{action.label}</Link> : <>{action.label}</>}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
