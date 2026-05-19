
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gavel, ShieldCheck, ShieldX, Eye } from "lucide-react";
import ClientRoleProtector from "@/components/ClientRoleProtector";

const mockReportedItems = [
  { id: "rep1", contentType: "Book Comment", contentSnippet: "This comment contains inappropriate language...", reporter: "UserA", reason: "Hate Speech", reportedDate: "2024-07-20", status: "Pending Review" },
  { id: "rep2", contentType: "Book Review", contentSnippet: "The review seems to be spam or self-promotion...", reporter: "UserB", reason: "Spam", reportedDate: "2024-07-19", status: "Resolved - Removed" },
  { id: "rep3", contentType: "Author Bio", contentSnippet: "Author bio includes external links that are suspicious...", reporter: "UserC", reason: "Suspicious Links", reportedDate: "2024-07-18", status: "Pending Review" },
];

function ContentModerationContent() {
  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <Gavel className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-headline mb-2">Content Moderation Queue</h1>
        <p className="text-lg text-muted-foreground">
          Review and take action on reported content to maintain community guidelines.
        </p>
      </header>

      <div className="space-y-6">
        {mockReportedItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline text-lg">{item.contentType} Report</CardTitle>
                <Badge 
                  variant={item.status === "Pending Review" ? "destructive" : "default"}
                  className={item.status !== "Pending Review" ? "bg-green-500 text-white dark:bg-green-600" : ""}
                >
                  {item.status}
                </Badge>
              </div>
              <CardDescription>Reported by: {item.reporter} on {item.reportedDate} for "{item.reason}"</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic text-muted-foreground mb-2">Content Snippet:</p>
              <p className="text-sm p-3 bg-muted/50 rounded-md border border-dashed">{item.contentSnippet}</p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex flex-wrap gap-2 w-full">
                <Button variant="outline" size="sm" onClick={() => alert(`Viewing full content for report '${item.id}' (UI Only)`)}>
                  <Eye className="mr-2 h-4 w-4" /> Review Full Content
                </Button>
                {item.status === "Pending Review" && (
                  <>
                    <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => alert(`Dismissing report '${item.id}' (UI Only)`)}>
                       <ShieldCheck className="mr-2 h-4 w-4" /> Dismiss Report
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => alert(`Taking action on report '${item.id}' (UI Only)`)}>
                      <ShieldX className="mr-2 h-4 w-4" /> Take Action
                    </Button>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {mockReportedItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-xl">No content currently in the moderation queue.</p>
        </div>
      )}
    </div>
  );
}

export default function ContentModerationPage() {
  return (
    <ClientRoleProtector allowedRoles={["editor", "admin"]} pageTitle="Content Moderation">
      <ContentModerationContent />
    </ClientRoleProtector>
  );
}
