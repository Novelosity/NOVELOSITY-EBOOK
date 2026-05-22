"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WritingCalendar } from "@/components/writing-calendar";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Eye, Users, BookText, PlusCircle, PenTool, Edit3,
  FileSignature, MoreVertical, Trash2, Settings2, BarChart2,
  Coins, Sparkles, GraduationCap, BookOpen, CalendarDays,
  TrendingUp, ChevronRight, Lightbulb, PenLine,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientRoleProtector from "@/components/ClientRoleProtector";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/contexts/AuthContext";
import { getNovelsByAuthor, updateNovel, deleteNovel, type Novel } from "@/actions/novels";
import { useToast } from "@/hooks/use-toast";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-700 border-green-200",
    draft: "bg-gray-100 text-gray-600 border-gray-200",
    submitted: "bg-blue-100 text-blue-700 border-blue-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? map.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {icon}
      <span className="font-semibold text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      <span>{label}</span>
    </div>
  );
}

function NovelCard({
  novel,
  onEdit,
  onWrite,
  onDelete,
  onContract,
}: {
  novel: Novel;
  onEdit: () => void;
  onWrite: () => void;
  onDelete: () => void;
  onContract: () => void;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
        <Image
          src={novel.coverImageUrl || "https://placehold.co/120x180/f9a8d4/be185d?text=Cover"}
          alt={novel.title}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <h3 className="font-bold text-base leading-tight truncate">{novel.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {novel.genre && (
                <span className="text-xs text-pink-600 font-medium">{novel.genre}</span>
              )}
              <StatusBadge status={novel.status} />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-0.5">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Settings2 className="mr-2 h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onWrite}>
                <PenTool className="mr-2 h-4 w-4" /> Write Chapter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/novel/${novel.id}`, '_blank')}>
                <BarChart2 className="mr-2 h-4 w-4" /> Preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <StatPill icon={<Eye className="h-3.5 w-3.5" />} value={novel.views} label="Views" />
          <StatPill icon={<Users className="h-3.5 w-3.5" />} value={novel.subscribers} label="Subscribers" />
          <StatPill icon={<BookText className="h-3.5 w-3.5" />} value={novel.chapterCount} label="Chapters" />
          <StatPill icon={<PenLine className="h-3.5 w-3.5" />} value={novel.wordCount.toLocaleString()} label="Words" />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-3"
            onClick={onEdit}
          >
            <Edit3 className="mr-1.5 h-3 w-3" /> Edit Details
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs px-3 bg-pink-500 hover:bg-pink-600 text-white"
            onClick={onWrite}
          >
            <PenTool className="mr-1.5 h-3 w-3" /> Write Chapter
          </Button>
          {novel.status === "published" && novel.wordCount >= 5000 && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-3 border-green-500 text-green-600 hover:bg-green-50"
              onClick={onContract}
            >
              <FileSignature className="mr-1.5 h-3 w-3" /> Apply for Contract
            </Button>
          )}
          {novel.status === "submitted" && (
            <Button size="sm" variant="outline" className="h-7 text-xs px-3" disabled>
              <FileSignature className="mr-1.5 h-3 w-3" /> Pending Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthorDashboardContent() {
  const router = useRouter();
  const { user } = useUser();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getNovelsByAuthor(user.id)
      .then(setNovels)
      .catch(() => toast({ title: "Error", description: "Failed to load novels.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalViews = novels.reduce((s, n) => s + n.views, 0);
  const totalSubscribers = novels.reduce((s, n) => s + n.subscribers, 0);
  const totalWords = novels.reduce((s, n) => s + n.wordCount, 0);
  const publishedCount = novels.filter((n) => n.status === "published").length;

  const filtered = filter === "all"
    ? novels
    : novels.filter((n) => (filter === "published" ? n.status === "published" : n.status === "draft"));

  const handleContract = async (novel: Novel) => {
    try {
      await updateNovel(novel.id, { status: "submitted" });
      setNovels((prev) => prev.map((n) => n.id === novel.id ? { ...n, status: "submitted" } : n));
      toast({ title: "Application submitted", description: `"${novel.title}" is under review.` });
    } catch {
      toast({ title: "Error", description: "Failed to submit.", variant: "destructive" });
    }
  };

  const handleDelete = async (novel: Novel) => {
    if (!confirm(`Delete "${novel.title}"? This cannot be undone.`)) return;
    try {
      await deleteNovel(novel.id);
      setNovels((prev) => prev.filter((n) => n.id !== novel.id));
      toast({ title: "Novel deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-5">
            {user?.imageUrl && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/40 shrink-0">
                <Image src={user.imageUrl} alt="avatar" fill className="object-cover" sizes="64px" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                {user?.firstName ?? userProfile?.displayName ?? "Author"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">Author</span>
                <span className="text-xs text-white/80">Member since {
                  userProfile?.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "—"
                }</span>
              </div>
            </div>
          </div>
          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: <BookOpen className="h-5 w-5" />, value: novels.length, label: "Works" },
              { icon: <Eye className="h-5 w-5" />, value: totalViews.toLocaleString(), label: "Total Views" },
              { icon: <Users className="h-5 w-5" />, value: totalSubscribers.toLocaleString(), label: "Subscribers" },
              { icon: <PenLine className="h-5 w-5" />, value: totalWords.toLocaleString(), label: "Words Written" },
            ].map(({ icon, value, label }) => (
              <div key={label} className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <div className="flex justify-center mb-1 opacity-80">{icon}</div>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-white/75 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-5 items-start">

        {/* ── Left sidebar ──────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 space-y-4 sticky top-4">

          {/* Wallet */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <Coins className="h-4 w-4 text-amber-600" />
                </div>
                <span className="font-semibold text-sm">Wallet</span>
              </div>
              <div className="text-3xl font-bold text-amber-600">
                {userProfile?.coins ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Coins available</div>
              <Button
                size="sm"
                className="w-full mt-3 h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => toast({ title: "Top-up coming soon!" })}
              >
                + Top Up
              </Button>
            </CardContent>
          </Card>

          {/* Stories nav */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-pink-600" />
                  </div>
                  <span className="font-semibold text-sm">My Stories</span>
                </div>
                <Badge variant="secondary" className="text-xs">{novels.length}</Badge>
              </div>
              <div className="space-y-1 mb-3">
                {[
                  { label: "All Works", count: novels.length, f: "all" as const },
                  { label: "Published", count: publishedCount, f: "published" as const },
                  { label: "Drafts", count: novels.length - publishedCount, f: "draft" as const },
                ].map(({ label, count, f }) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filter === f
                        ? "bg-pink-50 text-pink-700 font-medium"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-xs">{count}</span>
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                className="w-full h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white"
                asChild
              >
                <Link href="/author/create-novel">
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> New Story
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Writing Calendar */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-pink-500" /> Writing Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <WritingCalendar novels={novels} />
            </CardContent>
          </Card>
        </aside>

        {/* ── Main content ──────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-4">

          {/* My Works header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">My Works</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {novels.length} {novels.length === 1 ? "novel" : "novels"} ·{" "}
                {publishedCount} published
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/author-dashboard/statistics">
                  <BarChart2 className="mr-2 h-4 w-4" /> Statistics
                </Link>
              </Button>
              <Button
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 text-white"
                asChild
              >
                <Link href="/author/create-novel">
                  <PlusCircle className="mr-2 h-4 w-4" /> New Story
                </Link>
              </Button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border w-fit">
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-pink-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Tip banner */}
          <div className="flex items-start gap-3 bg-pink-50 border border-pink-100 rounded-xl px-4 py-3">
            <TrendingUp className="h-4 w-4 text-pink-500 mt-0.5 shrink-0" />
            <p className="text-sm text-pink-800">
              <span className="font-semibold">Tip:</span> Aim for at least{" "}
              <strong>5,000 words</strong> to qualify for a publishing contract.
              Publishing more chapters increases your visibility.
            </p>
          </div>

          {/* Novel list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-xl border">
              <BookOpen className="h-14 w-14 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">
                {filter === "all" ? "No novels yet. Create your first one!" : `No ${filter} novels.`}
              </p>
              <Button
                className="bg-pink-500 hover:bg-pink-600 text-white"
                asChild
              >
                <Link href="/author/create-novel">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Novel
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((novel) => (
                <NovelCard
                  key={novel.id}
                  novel={novel}
                  onEdit={() => router.push(`/author/create-novel?storyId=${novel.id}`)}
                  onWrite={() => router.push(`/author/write/${novel.id}`)}
                  onDelete={() => handleDelete(novel)}
                  onContract={() => handleContract(novel)}
                />
              ))}
            </div>
          )}
        </main>

        {/* ── Right sidebar ─────────────────────────────────────────── */}
        <aside className="w-56 shrink-0 space-y-4 sticky top-4">

          {/* Writers Academy */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-20 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-white/80" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1">Writers Academy</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Become a professional author in 5 weeks with guided lessons.
              </p>
              <Button size="sm" variant="outline" className="w-full h-8 text-xs" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Author Tools */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Author Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Link
                href="/tools/chapter-title-generator"
                className="flex items-center justify-between p-2.5 rounded-lg border hover:border-pink-300 hover:bg-pink-50 transition-colors text-sm"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500 shrink-0" />
                  <span>AI Title Generator</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <div className="flex items-center justify-between p-2.5 rounded-lg border opacity-50 text-sm cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Plot Helper</span>
                </div>
                <span className="text-xs text-muted-foreground">Soon</span>
              </div>
            </CardContent>
          </Card>

          {/* Contract eligibility */}
          {novels.some((n) => n.status === "published" && n.wordCount >= 5000) && (
            <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSignature className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-sm text-green-700">Contract Ready!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You have eligible works. Apply for a publishing contract now.
                </p>
              </CardContent>
            </Card>
          )}
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
