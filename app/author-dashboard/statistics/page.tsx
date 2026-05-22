"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import ClientRoleProtector from "@/components/ClientRoleProtector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  Eye, Users, BookText, PenLine, TrendingUp, MessageSquare,
  BookOpen, CalendarDays, BarChart2, ChevronLeft, Flame,
  CheckCircle, Clock, Star, DollarSign, ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import {
  getAuthorOverview,
  getNovelStatsList,
  getChapterStats,
  getDailyActivity,
  type AuthorOverview,
  type NovelStats,
  type ChapterStat,
  type DailyActivity,
} from "@/actions/statistics";
import { useToast } from "@/hooks/use-toast";

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function shortDate(ds: string) {
  const [, m, d] = ds.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft: "bg-gray-100 text-gray-600",
    submitted: "bg-blue-100 text-blue-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls[status] ?? cls.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.value.toLocaleString()} {p.name}
        </p>
      ))}
    </div>
  );
}

// ── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  sub?: string;
  delta?: number | null; // percentage change vs yesterday
}

function MetricCard({ label, value, icon, gradient, sub, delta }: MetricCardProps) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-md ${gradient} relative overflow-hidden`}>
      <div className="absolute right-4 top-4 opacity-20 scale-150">{icon}</div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-white/80 mb-1">{label}</p>
        <p className="text-3xl font-bold leading-tight">{typeof value === "number" ? value.toLocaleString() : value}</p>
        {sub && <p className="text-xs text-white/70 mt-1">{sub}</p>}
        {delta !== undefined && delta !== null && (
          <div className="flex items-center gap-1 mt-2">
            {delta > 0 ? (
              <ArrowUp className="h-3 w-3 text-green-300" />
            ) : delta < 0 ? (
              <ArrowDown className="h-3 w-3 text-red-300" />
            ) : (
              <Minus className="h-3 w-3 text-white/60" />
            )}
            <span className={`text-xs font-medium ${delta > 0 ? "text-green-300" : delta < 0 ? "text-red-300" : "text-white/60"}`}>
              {delta > 0 ? "+" : ""}{delta}% vs yesterday
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children, action }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="font-semibold text-base flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Main statistics component ────────────────────────────────────────────────

function StatisticsContent() {
  const { user } = useUser();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AuthorOverview | null>(null);
  const [novelStats, setNovelStats] = useState<NovelStats[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<string>("all");
  const [chapterStats, setChapterStats] = useState<ChapterStat[]>([]);
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [activityDays, setActivityDays] = useState<30 | 60 | 90>(30);

  // Load all data on mount
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getAuthorOverview(),
      getNovelStatsList(),
      getDailyActivity(30),
    ])
      .then(([ov, nv, act]) => {
        setOverview(ov);
        setNovelStats(nv);
        setActivity(act);
      })
      .catch(() => toast({ title: "Failed to load statistics", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload activity when days range or novel filter changes
  useEffect(() => {
    const novelId = selectedNovelId === "all" ? undefined : Number(selectedNovelId);
    getDailyActivity(activityDays, novelId).then(setActivity).catch(console.error);
  }, [activityDays, selectedNovelId]);

  // Load chapter stats when novel selected
  useEffect(() => {
    if (selectedNovelId === "all") {
      setChapterStats([]);
      return;
    }
    getChapterStats(Number(selectedNovelId)).then(setChapterStats).catch(console.error);
  }, [selectedNovelId]);

  // Derived: current novel or all
  const activeNovel = useMemo(
    () => novelStats.find((n) => String(n.id) === selectedNovelId) ?? null,
    [novelStats, selectedNovelId],
  );

  const displayOverview: AuthorOverview = selectedNovelId === "all"
    ? (overview ?? {
        totalWordsReleased: 0, chaptersReleased: 0, avgChapterLength: 0,
        writingDaysThisMonth: 0, totalViews: 0, totalSubscribers: 0,
        totalNovels: 0, totalComments: 0,
      })
    : {
        totalWordsReleased: activeNovel?.publishedWords ?? 0,
        chaptersReleased: activeNovel?.publishedChapters ?? 0,
        avgChapterLength: activeNovel?.avgChapterLength ?? 0,
        writingDaysThisMonth: overview?.writingDaysThisMonth ?? 0,
        totalViews: activeNovel?.views ?? 0,
        totalSubscribers: activeNovel?.subscribers ?? 0,
        totalNovels: 1,
        totalComments: 0,
      };

  const totalActivityWords = activity.reduce((s, d) => s + d.words, 0);
  const activeDays = activity.filter((d) => d.words > 0).length;
  const peakDay = activity.reduce<DailyActivity | null>(
    (best, d) => (!best || d.words > best.words ? d : best), null,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading statistics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/author-dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Statistics</h1>
                <p className="text-sm text-white/75 mt-0.5">
                  Track your writing performance and reader engagement
                </p>
              </div>
            </div>
            {/* Novel selector */}
            <Select value={selectedNovelId} onValueChange={setSelectedNovelId}>
              <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-white/50">
                <SelectValue placeholder="All Novels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Novels</SelectItem>
                {novelStats.map((n) => (
                  <SelectItem key={n.id} value={String(n.id)}>
                    {n.title.length > 25 ? n.title.slice(0, 25) + "…" : n.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── Data note ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800">
          <BarChart2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
          <span>
            <strong>Note:</strong> Release statistics reflect published chapters only.
            Writing activity includes all saved drafts.
          </span>
        </div>

        {/* ── 4 metric cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Word Count Released"
            value={fmt(displayOverview.totalWordsReleased)}
            sub="published chapter words"
            icon={<PenLine className="h-10 w-10" />}
            gradient="bg-gradient-to-br from-rose-400 to-pink-600"
          />
          <MetricCard
            label="Chapters Released"
            value={displayOverview.chaptersReleased}
            sub="published chapters"
            icon={<BookText className="h-10 w-10" />}
            gradient="bg-gradient-to-br from-teal-400 to-emerald-600"
          />
          <MetricCard
            label="Avg Chapter Length"
            value={displayOverview.avgChapterLength > 0 ? fmt(displayOverview.avgChapterLength) : "—"}
            sub="words per chapter"
            icon={<BarChart2 className="h-10 w-10" />}
            gradient="bg-gradient-to-br from-purple-400 to-violet-600"
          />
          <MetricCard
            label="Writing Days This Month"
            value={displayOverview.writingDaysThisMonth}
            sub={`of ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} days`}
            icon={<CalendarDays className="h-10 w-10" />}
            gradient="bg-gradient-to-br from-blue-400 to-indigo-600"
          />
        </div>

        {/* ── Secondary metric row ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Eye className="h-5 w-5 text-pink-500" />,
              label: "Total Views",
              value: fmt(displayOverview.totalViews),
              bg: "bg-pink-50 border-pink-100",
            },
            {
              icon: <Users className="h-5 w-5 text-teal-500" />,
              label: "Subscribers",
              value: fmt(displayOverview.totalSubscribers),
              bg: "bg-teal-50 border-teal-100",
            },
            {
              icon: <BookOpen className="h-5 w-5 text-purple-500" />,
              label: selectedNovelId === "all" ? "Total Novels" : "All Chapters",
              value: selectedNovelId === "all"
                ? displayOverview.totalNovels
                : (activeNovel?.chapterCount ?? 0),
              bg: "bg-purple-50 border-purple-100",
            },
            {
              icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
              label: "Comments",
              value: displayOverview.totalComments,
              bg: "bg-blue-50 border-blue-100",
            },
          ].map(({ icon, label, value, bg }) => (
            <div key={label} className={`rounded-xl border p-4 ${bg}`}>
              <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Writing Activity Chart ──────────────────────────────────── */}
        <Section
          title="Writing Activity"
          icon={<TrendingUp className="h-4 w-4 text-pink-500" />}
          action={
            <div className="flex gap-1">
              {([30, 60, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setActivityDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activityDays === d
                      ? "bg-pink-500 text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          }
        >
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{totalActivityWords.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Words in last {activityDays} days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">{activeDays}</p>
              <p className="text-xs text-muted-foreground">Active writing days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {peakDay && peakDay.words > 0 ? peakDay.words.toLocaleString() : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {peakDay && peakDay.words > 0 ? `Best day (${shortDate(peakDay.date)})` : "Best day"}
              </p>
            </div>
          </div>

          {totalActivityWords === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <PenLine className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">No writing activity in this period.</p>
              <p className="text-xs text-muted-foreground">Start writing chapters to see your progress here.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activity} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="wordGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  interval={Math.floor(activity.length / 6)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="words"
                  name="words written"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fill="url(#wordGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#ec4899" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* ── Novel Performance Table ─────────────────────────────────── */}
        {selectedNovelId === "all" && (
          <Section
            title="Novel Performance"
            icon={<BookOpen className="h-4 w-4 text-purple-500" />}
          >
            {novelStats.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No novels yet.</p>
                <Button className="mt-3 bg-pink-500 hover:bg-pink-600 text-white" size="sm" asChild>
                  <Link href="/author/create-novel">Create your first novel</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">Novel</th>
                      <th className="pb-3 px-3 font-medium text-muted-foreground text-right">Views</th>
                      <th className="pb-3 px-3 font-medium text-muted-foreground text-right">Subscribers</th>
                      <th className="pb-3 px-3 font-medium text-muted-foreground text-right">Chapters</th>
                      <th className="pb-3 px-3 font-medium text-muted-foreground text-right">Published</th>
                      <th className="pb-3 px-3 font-medium text-muted-foreground text-right">Words</th>
                      <th className="pb-3 px-3 font-medium text-muted-foreground text-right">Avg/Ch</th>
                      <th className="pb-3 pl-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {novelStats.map((n) => (
                      <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-11 rounded overflow-hidden shrink-0 bg-muted">
                              <Image
                                src={n.coverImageUrl || "https://placehold.co/64x88/f9a8d4/be185d?text=Cover"}
                                alt={n.title}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            </div>
                            <div>
                              <button
                                className="font-medium hover:text-pink-600 transition-colors text-left"
                                onClick={() => setSelectedNovelId(String(n.id))}
                              >
                                {n.title}
                              </button>
                              {n.genre && (
                                <p className="text-xs text-muted-foreground mt-0.5">{n.genre}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium">{fmt(n.views)}</td>
                        <td className="py-3 px-3 text-right font-medium">{fmt(n.subscribers)}</td>
                        <td className="py-3 px-3 text-right">{n.chapterCount}</td>
                        <td className="py-3 px-3 text-right text-teal-700 font-medium">{n.publishedChapters}</td>
                        <td className="py-3 px-3 text-right">{fmt(n.publishedWords)}</td>
                        <td className="py-3 px-3 text-right text-muted-foreground">
                          {n.avgChapterLength > 0 ? fmt(n.avgChapterLength) : "—"}
                        </td>
                        <td className="py-3 pl-3"><StatusBadge status={n.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {/* ── Single novel detail ─────────────────────────────────────── */}
        {selectedNovelId !== "all" && activeNovel && (
          <>
            {/* Novel header */}
            <div className="bg-white rounded-2xl border shadow-sm p-5 flex gap-5 items-start">
              <div className="relative w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-muted">
                <Image
                  src={activeNovel.coverImageUrl || "https://placehold.co/160x224/f9a8d4/be185d?text=Cover"}
                  alt={activeNovel.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold leading-tight">{activeNovel.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {activeNovel.genre && (
                        <span className="text-xs text-pink-600 font-medium">{activeNovel.genre}</span>
                      )}
                      <StatusBadge status={activeNovel.status} />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                      <Link href={`/author/create-novel?storyId=${activeNovel.id}`}>Edit Details</Link>
                    </Button>
                    <Button size="sm" className="h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white" asChild>
                      <Link href={`/author/write/${activeNovel.id}`}>Write Chapter</Link>
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[
                    { icon: <Eye className="h-4 w-4 text-pink-500" />, v: fmt(activeNovel.views), l: "Views" },
                    { icon: <Users className="h-4 w-4 text-teal-500" />, v: fmt(activeNovel.subscribers), l: "Subscribers" },
                    { icon: <BookText className="h-4 w-4 text-purple-500" />, v: activeNovel.chapterCount, l: "Chapters" },
                    { icon: <PenLine className="h-4 w-4 text-blue-500" />, v: fmt(activeNovel.wordCount), l: "Total Words" },
                  ].map(({ icon, v, l }) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="flex justify-center mb-1">{icon}</div>
                      <p className="text-lg font-bold">{v}</p>
                      <p className="text-xs text-muted-foreground">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chapter stats */}
            <Section
              title={`Chapters (${chapterStats.length})`}
              icon={<BookText className="h-4 w-4 text-teal-500" />}
            >
              {chapterStats.length === 0 ? (
                <div className="text-center py-10">
                  <BookText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No chapters yet.</p>
                  <Button size="sm" className="mt-3 bg-pink-500 hover:bg-pink-600 text-white" asChild>
                    <Link href={`/author/write/${selectedNovelId}`}>Write First Chapter</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Chapter word-count bar chart */}
                  <div className="mb-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Words per Chapter
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chapterStats} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis
                          dataKey="chapterNumber"
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                          tickLine={false}
                          label={{ value: "Chapter #", position: "insideBottom", offset: -2, fontSize: 11, fill: "#9ca3af" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar
                          dataKey="wordCount"
                          name="words"
                          fill="#ec4899"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Chapter table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 pr-4 font-medium text-muted-foreground">#</th>
                          <th className="pb-2 pr-4 font-medium text-muted-foreground">Title</th>
                          <th className="pb-2 px-3 font-medium text-muted-foreground text-right">Words</th>
                          <th className="pb-2 px-3 font-medium text-muted-foreground text-right">Price</th>
                          <th className="pb-2 pl-3 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {chapterStats.map((ch) => (
                          <tr key={ch.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 pr-4 text-muted-foreground font-mono text-xs">{ch.chapterNumber}</td>
                            <td className="py-2.5 pr-4 font-medium">{ch.title}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums">{ch.wordCount.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right">
                              {ch.isPaid ? (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                  <DollarSign className="h-3 w-3" />
                                  {ch.coinCost} coins
                                </span>
                              ) : (
                                <span className="text-green-600 font-medium">Free</span>
                              )}
                            </td>
                            <td className="py-2.5 pl-3"><StatusBadge status={ch.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                      {/* Totals row */}
                      <tfoot>
                        <tr className="border-t bg-gray-50">
                          <td colSpan={2} className="py-2.5 pr-4 font-semibold text-sm">Total</td>
                          <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                            {chapterStats.reduce((s, c) => s + c.wordCount, 0).toLocaleString()}
                          </td>
                          <td />
                          <td className="py-2.5 pl-3 text-xs text-muted-foreground">
                            {chapterStats.filter((c) => c.status === "published").length} published
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </Section>
          </>
        )}

        {/* ── Release cadence (all novels view) ──────────────────────── */}
        {selectedNovelId === "all" && novelStats.length > 0 && (
          <Section
            title="Release Progress"
            icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
          >
            <div className="space-y-4">
              {novelStats.map((n) => {
                const pct = n.chapterCount > 0
                  ? Math.round((n.publishedChapters / n.chapterCount) * 100)
                  : 0;
                const wordPct = Math.min(100, Math.round((n.wordCount / 5000) * 100));
                return (
                  <div key={n.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        className="font-medium text-sm hover:text-pink-600 transition-colors"
                        onClick={() => setSelectedNovelId(String(n.id))}
                      >
                        {n.title}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {n.publishedChapters}/{n.chapterCount} ch published
                        </span>
                        <StatusBadge status={n.status} />
                      </div>
                    </div>
                    {/* Chapter publish progress */}
                    <div className="mb-1">
                      <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                        <span>Published chapters</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    {/* Contract word progress */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                        <span>Contract eligibility (5,000 words)</span>
                        <span>{n.wordCount.toLocaleString()} / 5,000</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${wordPct >= 100 ? "bg-green-500" : "bg-pink-400"}`}
                          style={{ width: `${wordPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

      </div>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <ClientRoleProtector allowedRoles={["author"]} pageTitle="Statistics">
      <StatisticsContent />
    </ClientRoleProtector>
  );
}
