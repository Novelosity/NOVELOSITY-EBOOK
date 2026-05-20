"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  BookCopy, TrendingUp, Users, Edit3, PlusCircle, PenTool,
  CalendarDays, Library, Eye, BookText, AlertCircle, Lightbulb,
  GraduationCap, Sparkles, MoreVertical, FileSignature, BarChart2,
  Settings2, Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientRoleProtector from "@/components/ClientRoleProtector";
import { useUser } from "@clerk/nextjs";
import { getNovelsByAuthor, updateNovel, deleteNovel, type Novel } from "@/actions/novels";
import { useToast } from "@/hooks/use-toast";

function AuthorDashboardContent() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getNovelsByAuthor(user.id)
      .then(setNovels)
      .catch(() => toast({ title: "Error", description: "Failed to load novels.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [user]);

  const totalViews = novels.reduce((sum, n) => sum + n.views, 0);
  const totalSubscribers = novels.reduce((sum, n) => sum + n.subscribers, 0);
  const totalWords = novels.reduce((sum, n) => sum + n.wordCount, 0);
  const publishedCount = novels.filter((n) => n.status === "published").length;

  const handleApplyForContract = async (novel: Novel) => {
    try {
      await updateNovel(novel.id, { status: "submitted" });
      setNovels((prev) => prev.map((n) => n.id === novel.id ? { ...n, status: "submitted" } : n));
      toast({ title: "Contract application submitted", description: `"${novel.title}" has been submitted for review.` });
    } catch {
      toast({ title: "Error", description: "Failed to submit contract application.", variant: "destructive" });
    }
  };

  const handleDelete = async (novel: Novel) => {
    if (!confirm(`Delete "${novel.title}"? This cannot be undone.`)) return;
    try {
      await deleteNovel(novel.id);
      setNovels((prev) => prev.filter((n) => n.id !== novel.id));
      toast({ title: "Novel deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete novel.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline text-primary">Author Dashboard</h1>
        <p className="text-muted-foreground">Manage your stories, track performance, and engage with readers.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Novels</CardTitle>
            <BookCopy className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{novels.length}</div>
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <li>{publishedCount} Published</li>
              <li>{novels.length - publishedCount} Draft / In Review</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link href="/author/create-novel"><PlusCircle className="mr-2 h-4 w-4" /> New Novel</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all novels</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total across all novels</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Novel list */}
        <section className="lg:col-span-2">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-headline flex items-center">
                  <Library className="mr-2 h-6 w-6 text-primary" /> My Novels
                </CardTitle>
                <Button size="sm" asChild>
                  <Link href="/author/create-novel"><PlusCircle className="mr-2 h-4 w-4" /> New</Link>
                </Button>
              </div>
              <CardDescription>Manage your novels or start a new one.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md mb-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                <p className="text-sm text-foreground/80">
                  <span className="font-semibold text-primary">Tip: </span>
                  Aim for at least 5,000 words to qualify for a publishing contract.
                </p>
              </div>

              {loading && (
                <p className="text-center text-muted-foreground py-8">Loading your novels...</p>
              )}

              {!loading && novels.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">No novels yet. Start your first one!</p>
                  <Button asChild>
                    <Link href="/author/create-novel"><PlusCircle className="mr-2 h-4 w-4" /> Create Novel</Link>
                  </Button>
                </div>
              )}

              <div className="space-y-6">
                {novels.map((novel) => (
                  <Card key={novel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/4 relative aspect-[2/3] sm:aspect-auto">
                        <Image
                          src={novel.coverImageUrl || "https://placehold.co/300x450.png"}
                          alt={novel.title}
                          fill
                          className="object-cover"
                          sizes="25vw"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-headline mb-1">{novel.title}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/reader/${novel.id}/chapter-1`)}>
                                <BarChart2 className="mr-2 h-4 w-4" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/author/create-novel?storyId=${novel.id}`)}>
                                <Settings2 className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive hover:!bg-destructive/10"
                                onClick={() => handleDelete(novel)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                          <span><Users className="inline h-3 w-3 mr-1" />{novel.subscribers.toLocaleString()} Subscribers</span>
                          <span><Eye className="inline h-3 w-3 mr-1" />{novel.views.toLocaleString()} Views</span>
                          <span><BookText className="inline h-3 w-3 mr-1" />{novel.wordCount.toLocaleString()} Words</span>
                          <Badge variant="secondary">{novel.status}</Badge>
                        </div>

                        {novel.updatedAt && (
                          <p className="text-xs text-muted-foreground mb-3">
                            Last updated: {new Date(novel.updatedAt).toLocaleDateString()}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => router.push(`/author/write/${novel.id}`)}>
                            <PenTool className="mr-2 h-4 w-4" /> New Chapter
                          </Button>
                          <Button size="sm" onClick={() => router.push(`/author/create-novel?storyId=${novel.id}`)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Details
                          </Button>
                          {novel.status === "published" && (
                            novel.wordCount >= 5000 ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-500/10"
                                onClick={() => handleApplyForContract(novel)}
                              >
                                <FileSignature className="mr-2 h-4 w-4" /> Apply for Contract
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                <FileSignature className="mr-2 h-4 w-4" />
                                Need {(5000 - novel.wordCount).toLocaleString()} more words
                              </Button>
                            )
                          )}
                          {novel.status === "submitted" && (
                            <Button size="sm" variant="outline" disabled>
                              <FileSignature className="mr-2 h-4 w-4" /> Application Pending
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-primary" /> Content Calendar
              </CardTitle>
              <CardDescription>Track your writing schedule.</CardDescription>
            </CardHeader>
            <CardContent>
              {novels.length > 0 && (
                <div className="mb-4">
                  <Select defaultValue={String(novels[0].id)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select novel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {novels.map((n) => (
                        <SelectItem key={n.id} value={String(n.id)}>{n.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="rounded-md border bg-background p-0.5">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="w-full p-0"
                />
              </div>
              <Separator className="my-3" />
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-semibold text-primary">{totalWords.toLocaleString()} words</span> written across all novels
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" /> Author Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tools/chapter-title-generator">
                  <Sparkles className="mr-2 h-4 w-4" /> AI Chapter Title Generator
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <PenTool className="mr-2 h-4 w-4" /> Plot Helper (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-primary" /> Writers Academy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Resources, tips, and tutorials to hone your craft.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default function AuthorDashboardPage() {
  return (
    <ClientRoleProtector allowedRoles={["author"]} pageTitle="Author Dashboard">
      <AuthorDashboardContent />
    </ClientRoleProtector>
  );
}
