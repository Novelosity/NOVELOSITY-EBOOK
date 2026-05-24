"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck, Users, BookCopy, Megaphone, LineChart, Banknote,
  Settings2, ListChecks, GitFork, UserCog, AlertTriangle, TrendingUp,
  Activity, DollarSign, FileText, Eye, Lock, Ticket,
} from "lucide-react";
import Link from "next/link";
import ClientRoleProtector from "@/components/ClientRoleProtector";

const systemStats = [
  { label: "Total Users", value: "14,823", change: "+142 this week", icon: Users, color: "text-blue-500" },
  { label: "Active Novels", value: "3,461", change: "+38 this week", icon: BookCopy, color: "text-purple-500" },
  { label: "Open Reports", value: "17", change: "4 urgent", icon: AlertTriangle, color: "text-orange-500" },
  { label: "Revenue (MTD)", value: "$8,240", change: "+12% vs last month", icon: DollarSign, color: "text-green-500" },
];

const recentActivity = [
  { action: "New user registered", detail: "alice@email.com joined as reader", time: "2 min ago", type: "info" },
  { action: "Novel flagged", detail: '"Dark Veil" reported for mature content', time: "18 min ago", type: "warning" },
  { action: "Author payout processed", detail: "$320 sent to Elara Vance", time: "1h ago", type: "success" },
  { action: "Role updated", detail: 'Jax Ryder promoted to author', time: "3h ago", type: "info" },
  { action: "Content removed", detail: 'Spam comment #4821 deleted by editor', time: "5h ago", type: "danger" },
];

const managementSections = [
  {
    title: "User Management",
    description: "Manage users, assign roles, and handle bans.",
    icon: UserCog,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    actions: [
      { label: "View All Users", href: "/admin/users" },
      { label: "Role Assignments", href: "/admin/users" },
    ],
  },
  {
    title: "Content Management",
    description: "Approve novels, manage categories and tags.",
    icon: BookCopy,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    actions: [
      { label: "Manage Books", href: "#" },
      { label: "Categories & Tags", href: "#" },
    ],
  },
  {
    title: "Moderation & Reports",
    description: "Review reported content and handle violations.",
    icon: ListChecks,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    actions: [
      { label: "Moderation Queue", href: "/content-moderation" },
      { label: "View Reports", href: "#" },
    ],
  },
  {
    title: "Analytics",
    description: "Platform metrics, DAU, retention, and revenue.",
    icon: LineChart,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    actions: [
      { label: "View Dashboard", href: "#" },
      { label: "Export Report", href: "#" },
    ],
  },
  {
    title: "Financial Overview",
    description: "Payments, subscriptions, and author payouts.",
    icon: Banknote,
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    actions: [
      { label: "Transactions", href: "#" },
      { label: "Process Payouts", href: "#" },
    ],
  },
  {
    title: "Promotions",
    description: "Run campaigns, discount codes, and feature books.",
    icon: Megaphone,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    actions: [
      { label: "Create Promotion", href: "#" },
      { label: "Featured Books", href: "#" },
    ],
  },
  {
    title: "Site Configuration",
    description: "Platform-wide settings and integrations.",
    icon: Settings2,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    actions: [
      { label: "Edit Settings", href: "#" },
    ],
  },
  {
    title: "System Logs",
    description: "Audit trails, system health, and flagged content.",
    icon: GitFork,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    actions: [
      { label: "Audit Logs", href: "#" },
      { label: "System Status", href: "#" },
    ],
  },
];

const activityTypeStyles: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-600 border-blue-200",
  warning: "bg-orange-500/10 text-orange-600 border-orange-200",
  success: "bg-green-500/10 text-green-600 border-green-200",
  danger: "bg-red-500/10 text-red-600 border-red-200",
};

function AdminPortalContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Portal Header */}
      <div className="border-b bg-card px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold">Admin Command Center</h1>
              <p className="text-sm text-muted-foreground">Novelosity Platform Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-red-400 text-red-500">
              <Lock className="mr-1 h-3 w-3" />
              Admin Only
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Back to Main Site</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* System Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <stat.icon className={`h-8 w-8 mt-0.5 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid + Activity Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Management Sections */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Platform Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {managementSections.map((section) => (
                <Card key={section.title} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`rounded-md p-1.5 ${section.bgColor}`}>
                        <section.icon className={`h-4 w-4 ${section.color}`} />
                      </div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </div>
                    <CardDescription className="text-xs">{section.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t pt-3 flex gap-2 flex-wrap">
                    {section.actions.map((action) => (
                      <Button
                        key={action.label}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        asChild={action.href !== "#"}
                        onClick={() => action.href === "#" && alert(`${action.label} (UI Placeholder)`)}
                      >
                        {action.href !== "#" ? (
                          <Link href={action.href}>{action.label}</Link>
                        ) : (
                          <>{action.label}</>
                        )}
                      </Button>
                    ))}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => alert("Full audit log (UI Placeholder)")}>
                View All
              </Button>
            </div>
            <Card>
              <CardContent className="pt-4 space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium border ${activityTypeStyles[activity.type]}`}>
                        {activity.type.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{activity.action}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{activity.detail}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                    {i < recentActivity.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Admin Actions */}
            <h2 className="text-lg font-semibold pt-2">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/admin/users">
                  <UserCog className="h-4 w-4" /> Manage Users
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/content-moderation">
                  <ListChecks className="h-4 w-4" /> Moderation Queue
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => alert("View Reports (UI Placeholder)")}>
                <FileText className="h-4 w-4" /> View Reports
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/editorial-dashboard">
                  <Eye className="h-4 w-4" /> Editorial Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPortalPage() {
  return (
    <ClientRoleProtector allowedRoles={["admin"]} pageTitle="Admin Portal">
      <AdminPortalContent />
    </ClientRoleProtector>
  );
}
