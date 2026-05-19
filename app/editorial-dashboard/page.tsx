
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle, XCircle, MessageSquareWarning, Eye } from "lucide-react";
import Link from "next/link"; 
import ClientRoleProtector from "@/components/ClientRoleProtector";

const mockSubmissions = [
  { id: "sub1", title: "The Dragon's Heir", author: "Elara Vance", status: "Pending Review", genre: "Fantasy", submittedDate: "2024-07-15" },
  { id: "sub2", title: "Cybernetic Dawn", author: "Jax Ryder", status: "Edits Suggested", genre: "Sci-Fi", submittedDate: "2024-07-10" },
  { id: "sub3", title: "Cosmic Cantata", author: "Mira Quasar", status: "Approved", genre: "Space Opera", submittedDate: "2024-07-05" },
];

function EditorialDashboardContent() {
  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <ClipboardList className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-headline mb-2">Editorial Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Manage book submissions, track progress, and make editorial decisions.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSubmissions.map((submission) => (
          <Card key={submission.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline text-xl mb-1">{submission.title}</CardTitle>
                <Badge 
                  variant={
                    submission.status === "Pending Review" ? "secondary" :
                    submission.status === "Edits Suggested" ? "outline" : 
                    submission.status === "Approved" ? "default" : 
                    "secondary"
                  }
                  className={
                    submission.status === "Edits Suggested" ? "border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300" :
                    submission.status === "Approved" ? "bg-green-500 text-white dark:bg-green-600" : ""
                  }
                >
                  {submission.status}
                </Badge>
              </div>
              <CardDescription>By {submission.author} - Submitted: {submission.submittedDate}</CardDescription>
              <CardDescription className="text-xs text-muted-foreground">Genre: {submission.genre}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {submission.status === "Edits Suggested" 
                  ? "Editor feedback provided. Awaiting author revisions."
                  : submission.status === "Pending Review" 
                  ? "This submission is awaiting initial review from the editorial team."
                  : "This submission has been approved for publication."
                }
              </p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex flex-wrap gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1 min-w-[100px]" onClick={() => alert(`Viewing details for '${submission.title}' (UI Only)`)}>
                  <Eye className="mr-2 h-4 w-4" /> View
                </Button>
                {submission.status !== "Approved" && (
                  <Button variant="outline" size="sm" className="flex-1 min-w-[100px]" onClick={() => alert(`Approving '${submission.title}' (UI Only)`)}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                  </Button>
                )}
                {submission.status === "Pending Review" && (
                   <Button variant="outline" size="sm" className="flex-1 min-w-[100px]" onClick={() => alert(`Suggesting edits for '${submission.title}' (UI Only)`)}>
                    <MessageSquareWarning className="mr-2 h-4 w-4" /> Suggest Edits
                  </Button>
                )}
                {submission.status !== "Approved" && (
                  <Button variant="destructive" size="sm" className="flex-1 min-w-[100px]" onClick={() => alert(`Rejecting '${submission.title}' (UI Only)`)}>
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {mockSubmissions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-xl">No submissions currently in the dashboard.</p>
        </div>
      )}
    </div>
  );
}

export default function EditorialDashboardPage() {
  return (
    <ClientRoleProtector allowedRoles={["editor"]} pageTitle="Editorial Dashboard">
      <EditorialDashboardContent />
    </ClientRoleProtector>
  );
}
