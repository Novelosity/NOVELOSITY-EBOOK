"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList, CheckCircle, XCircle, MessageSquareWarning, Eye,
  Gavel, ShieldCheck, ShieldX, Edit3, Users, FileText,
  Clock, TrendingUp, AlertTriangle, MessageSquare, BookOpen,
} from "lucide-react";
import Link from "next/link";
import ClientRoleProtector from "@/components/ClientRoleProtector";

const mockSubmissions = [
  { id: "sub1", title: "The Dragon's Heir", author: "Elara Vance", status: "Pending Review", genre: "Fantasy", submittedDate: "2025-05-18", wordCount: "142k" },
  { id: "sub2", title: "Cybernetic Dawn", author: "Jax Ryder", status: "Edits Suggested", genre: "Sci-Fi", submittedDate: "2025-05-15", wordCount: "98k" },
  { id: "sub3", title: "Cosmic Cantata", author: "Mira Quasar", status: "Approved", genre: "Space Opera", submittedDate: "2025-05-10", wordCount: "210k" },
  { id: "sub4", title: "Whispers in the Dark", author: "Caden Holt", status: "Pending Review", genre: "Horror", submittedDate: "2025-05-20", wordCount: "75k" },
];

const mockReports = [
  { id: "rep1", contentType: "Book Comment", snippet: "This comment contains inappropriate language...", reporter: "UserA", reason: "Hate Speech", date: "2025-05-22", status: "Pending Review" },
  { id: "rep2", contentType: "Book Review", snippet: "The review seems to be spam or self-promotion...", reporter: "UserB", reason: "Spam", date: "2025-05-21", status: "Resolved" },
  { id: "rep3", contentType: "Author Bio", snippet: "Author bio includes external links that are suspicious...", reporter: "UserC", reason: "Suspicious Links", date: "2025-05-20", status: "Pending Review" },
];

const mockAuthorMessages = [
  { id: "am1", author: "Elara Vance", subject: "Re: Revision feedback on Ch. 4", preview: "Thank you for the detailed notes. I've revised the pacing and will resubmit by Friday.", date: "2025-05-23", unread: true },
  { id: "am2", author: "Jax Ryder", subject: "Question about content guidelines", preview: "I wanted to clarify the rules around mature themes in sci-fi settings...", date: "2025-05-22", unread: false },
  { id: "am3", author: "Mira Quasar", subject: "Submission #3 approved — next steps?", preview: "Hi, I saw Cosmic Cantata was approved. What happens next for the launch?", date: "2025-05-21", unread: true },
];

const stats = [
  { label: "Pending Submissions", value: "7", icon: ClipboardList, color: "text-blue-500" },
  { label: "Reports in Queue", value: "4", icon: AlertTriangle, color: "text-orange-500" },
  { label: "Authors Supported", value: "23", icon: Users, color: "text-green-500" },
  { label: "Approved This Month", value: "12", icon: TrendingUp, color: "text-purple-500" },
];

function EditorPortalContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Portal Header */}
      <div className="border-b bg-card px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Edit3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold">Editor Portal</h1>
              <p className="text-sm text-muted-foreground">Novelosity Editorial Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-500 text-green-600">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500" />
              Active
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Back to Main Site</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="submissions">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Submissions
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">7</Badge>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Moderation
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">4</Badge>
            </TabsTrigger>
            <TabsTrigger value="authors" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Authors
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">2</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Manuscript Submissions</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/editorial-dashboard">View Full Dashboard</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSubmissions.map((sub) => (
                <Card key={sub.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base font-semibold leading-tight">{sub.title}</CardTitle>
                      <Badge
                        variant={
                          sub.status === "Pending Review" ? "secondary" :
                          sub.status === "Edits Suggested" ? "outline" :
                          "default"
                        }
                        className={
                          sub.status === "Edits Suggested" ? "border-yellow-500 text-yellow-700 whitespace-nowrap" :
                          sub.status === "Approved" ? "bg-green-500 text-white whitespace-nowrap" : "whitespace-nowrap"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      By {sub.author} · {sub.genre} · {sub.wordCount} words
                    </CardDescription>
                    <CardDescription className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Submitted {sub.submittedDate}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t pt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => alert(`Viewing '${sub.title}' (UI Only)`)}>
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                    </Button>
                    {sub.status !== "Approved" && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => alert(`Approving '${sub.title}' (UI Only)`)}>
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-green-600" /> Approve
                      </Button>
                    )}
                    {sub.status === "Pending Review" && (
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => alert(`Rejecting '${sub.title}' (UI Only)`)}>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Content Moderation Queue</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/content-moderation">View Full Queue</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {mockReports.map((report) => (
                <Card key={report.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{report.contentType} Report</CardTitle>
                        <CardDescription className="text-xs">
                          Reported by {report.reporter} · Reason: {report.reason} · {report.date}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={report.status === "Pending Review" ? "destructive" : "default"}
                        className={report.status !== "Pending Review" ? "bg-green-500 text-white" : ""}
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm italic text-muted-foreground bg-muted/40 rounded p-2 border border-dashed">
                      "{report.snippet}"
                    </p>
                  </CardContent>
                  {report.status === "Pending Review" && (
                    <CardFooter className="border-t pt-3 gap-2">
                      <Button variant="outline" size="sm" onClick={() => alert(`Reviewing report ${report.id} (UI Only)`)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> Review
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => alert(`Dismissing report ${report.id} (UI Only)`)}>
                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Dismiss
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => alert(`Taking action on report ${report.id} (UI Only)`)}>
                        <ShieldX className="mr-1.5 h-3.5 w-3.5" /> Take Action
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Author Communication Tab */}
          <TabsContent value="authors" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Author Messages</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/author-communication">Open Full Inbox</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {mockAuthorMessages.map((msg) => (
                <Card key={msg.id} className={`hover:shadow-sm transition-shadow cursor-pointer ${msg.unread ? "border-primary/40 bg-primary/5" : ""}`}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{msg.author}</span>
                          {msg.unread && <Badge className="h-4 px-1.5 text-[10px]">New</Badge>}
                          <span className="text-xs text-muted-foreground ml-auto">{msg.date}</span>
                        </div>
                        <p className="text-sm font-medium truncate">{msg.subject}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{msg.preview}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => alert(`Opening message from ${msg.author} (UI Only)`)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function EditorPortalPage() {
  return (
    <ClientRoleProtector allowedRoles={["editor", "admin"]} pageTitle="Editor Portal">
      <EditorPortalContent />
    </ClientRoleProtector>
  );
}
