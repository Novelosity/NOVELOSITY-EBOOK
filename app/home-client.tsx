"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Eye, ChevronLeft, ChevronRight, TrendingUp, Sparkles,
  BookOpen, PenTool, Flame, Star, Search, ArrowRight,
} from "lucide-react";
import type { Novel } from "@/actions/novels";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const GENRES = [
  "All", "Romance", "Fantasy", "Sci-Fi", "Mystery", "Thriller",
  "Historical", "Mafia", "Werewolf", "Urban", "LGBTQ+", "Paranormal",
  "YA/Teen", "Eastern", "Other",
];

// ── Novel card — GoodNovel style ──────────────────────────────────────────────

export function NovelCard({ novel, rank }: { novel: Novel; rank?: number }) {
  return (
    <Link href={`/novel/${novel.id}`} className="group block">
      <div className="relative">
        {/* Cover */}
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md group-hover:shadow-xl transition-shadow duration-300">
          <Image
            src={novel.coverImageUrl || `https://placehold.co/200x300/fce7f3/be185d?text=${encodeURIComponent(novel.title.slice(0, 10))}`}
            alt={novel.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 20vw, 160px"
          />
          {/* Rank badge */}
          {rank !== undefined && (
            <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
              rank === 1 ? "bg-amber-400 text-amber-900" :
              rank === 2 ? "bg-gray-300 text-gray-700" :
              rank === 3 ? "bg-amber-700 text-amber-100" :
              "bg-black/60 text-white"
            }`}>
              {rank}
            </div>
          )}
          {/* Genre badge */}
          {novel.genre && (
            <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {novel.genre}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-2.5 px-0.5">
          <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {novel.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">by {novel.authorName}</p>
          {novel.synopsis && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed hidden sm:block">
              {novel.synopsis}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1.5">
            <Eye className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{fmtViews(novel.views)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon, title, href, subtitle,
}: {
  icon: React.ReactNode; title: string; href?: string; subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold font-headline">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
          More <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

// ── Hero Carousel ─────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    gradient: "from-rose-600 via-pink-700 to-purple-800",
    tag: "Featured",
    title: "Discover Your Next Favorite Story",
    sub: "Thousands of novels across every genre — free to read.",
    cta: "Start Reading",
    href: "/browse",
    img: null,
  },
  {
    gradient: "from-indigo-600 via-blue-700 to-teal-700",
    tag: "New Authors",
    title: "Your Story Deserves to Be Told",
    sub: "Write, publish, and grow your audience on Novelosity.",
    cta: "Start Writing",
    href: "/author/create-novel",
    img: null,
  },
  {
    gradient: "from-amber-600 via-orange-600 to-rose-600",
    tag: "Trending",
    title: "Top Novels Rising This Week",
    sub: "See what readers can't put down right now.",
    cta: "View Rankings",
    href: "/browse",
    img: null,
  },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % HERO_SLIDES.length), 5000);
  };

  useEffect(() => {
    reset();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (dir: 1 | -1) => {
    setCurrent((p) => (p + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    reset();
  };

  const slide = HERO_SLIDES[current];

  return (
    <div className="relative h-52 sm:h-64 md:h-72 overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-all duration-700`} />
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full translate-y-1/2" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-8 md:px-14 max-w-3xl">
        <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3">
          <Flame className="h-3 w-3" /> {slide.tag}
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline text-white leading-tight">
          {slide.title}
        </h1>
        <p className="text-white/80 mt-2 text-sm sm:text-base">{slide.sub}</p>
        <div className="mt-4">
          <Button asChild size="sm" className="bg-white text-gray-900 hover:bg-white/90 font-semibold shadow">
            <Link href={slide.href}>{slide.cta}</Link>
          </Button>
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); reset(); }}
            className={`rounded-full transition-all ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Rising ranked list ────────────────────────────────────────────────────────

function RisingList({ novels }: { novels: Novel[] }) {
  return (
    <div className="space-y-4">
      {novels.slice(0, 5).map((novel, i) => (
        <Link key={novel.id} href={`/novel/${novel.id}`} className="flex items-center gap-3 group">
          {/* Rank number */}
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
            i === 0 ? "bg-gradient-to-b from-amber-300 to-amber-500 text-amber-900" :
            i === 1 ? "bg-gradient-to-b from-gray-200 to-gray-400 text-gray-700" :
            i === 2 ? "bg-gradient-to-b from-amber-600 to-amber-800 text-amber-100" :
            "bg-muted text-muted-foreground"
          }`}>
            {i + 1}
          </span>
          {/* Thumbnail */}
          <div className="relative w-10 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0 shadow">
            <Image
              src={novel.coverImageUrl || `https://placehold.co/80x112/fce7f3/be185d?text=${encodeURIComponent(novel.title.slice(0, 4))}`}
              alt={novel.title}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors leading-tight">
              {novel.title}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">by {novel.authorName}</p>
            <div className="flex items-center gap-1 mt-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{fmtViews(novel.views)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Genre tabs ────────────────────────────────────────────────────────────────

function GenreTabs({
  activeGenre, onChange,
}: {
  activeGenre: string; onChange: (g: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      style={{ scrollbarWidth: "none" }}
    >
      {GENRES.map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeGenre === g
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

// ── Main exported client component ───────────────────────────────────────────

export interface HomeProps {
  trending: Novel[];
  newReleases: Novel[];
  allPublished: Novel[];
}

export function HomeClient({ trending, newReleases, allPublished }: HomeProps) {
  const [activeGenre, setActiveGenre] = useState("All");

  const filtered = activeGenre === "All"
    ? allPublished
    : allPublished.filter((n) => n.genre === activeGenre);

  const displayList = filtered.slice(0, 12);
  const hasContent = allPublished.length > 0;

  return (
    <div className="-mx-6 -mt-6">

      {/* ── Hero Carousel ─────────────────────────────────────────── */}
      <HeroCarousel />

      {/* ── Page body ─────────────────────────────────────────────── */}
      <div className="px-5 py-6 max-w-screen-xl mx-auto">

        {/* ── Genre tabs + main grid + rising sidebar ──────────────── */}
        <div className="flex gap-6">

          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Genre tabs */}
            <GenreTabs activeGenre={activeGenre} onChange={setActiveGenre} />

            {/* Filtered novels grid */}
            {displayList.length > 0 ? (
              <div>
                {activeGenre !== "All" && (
                  <SectionHeader
                    icon={<BookOpen className="h-5 w-5 text-primary" />}
                    title={activeGenre}
                    subtitle={`${filtered.length} ${filtered.length === 1 ? "novel" : "novels"} in this genre`}
                    href="/browse"
                  />
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {displayList.map((n) => <NovelCard key={n.id} novel={n} />)}
                </div>
                {filtered.length > 12 && (
                  <div className="mt-5 text-center">
                    <Button variant="outline" asChild>
                      <Link href="/browse">See all {activeGenre !== "All" ? activeGenre : ""} novels</Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <BookOpen className="h-14 w-14 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No novels in this genre yet.</p>
                <Button asChild size="sm">
                  <Link href="/author/create-novel">Be the first to publish</Link>
                </Button>
              </div>
            )}

            {/* Trending section (only on All tab) */}
            {activeGenre === "All" && trending.length > 0 && (
              <div>
                <SectionHeader
                  icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
                  title="Trending Now"
                  subtitle="Most-read novels this week"
                  href="/browse"
                />
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {trending.map((n, i) => <NovelCard key={n.id} novel={n} rank={i + 1} />)}
                </div>
              </div>
            )}

            {/* New Releases (only on All tab) */}
            {activeGenre === "All" && newReleases.length > 0 && (
              <div>
                <SectionHeader
                  icon={<Sparkles className="h-5 w-5 text-purple-500" />}
                  title="New Releases"
                  subtitle="Fresh stories just published"
                  href="/browse"
                />
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {newReleases.map((n) => <NovelCard key={n.id} novel={n} />)}
                </div>
              </div>
            )}

            {/* Empty state — no published novels at all */}
            {!hasContent && activeGenre === "All" && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/20" />
                <h3 className="text-lg font-semibold">The library is empty</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  No published novels yet. Be the first author to share your story!
                </p>
                <Button asChild className="mt-1">
                  <Link href="/author/create-novel">Start Writing</Link>
                </Button>
              </div>
            )}
          </div>

          {/* ── Right sidebar ─────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 gap-6">

            {/* Rising novels */}
            {trending.length > 0 && (
              <div className="bg-white rounded-2xl border shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <h3 className="font-bold text-base">Rising</h3>
                </div>
                <RisingList novels={trending} />
                <Link
                  href="/browse"
                  className="flex items-center justify-center gap-1 mt-4 text-xs text-primary hover:underline font-medium"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Start Writing CTA */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-orange-600 text-white p-5">
              <PenTool className="h-8 w-8 mb-3 opacity-80" />
              <h3 className="font-bold text-base leading-snug mb-1">
                Share Your Story
              </h3>
              <p className="text-xs text-white/80 mb-4 leading-relaxed">
                Join thousands of authors publishing on Novelosity. Free to start.
              </p>
              <Button size="sm" asChild className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold">
                <Link href="/author/create-novel">Start Writing</Link>
              </Button>
            </div>

            {/* Popular genres quick links */}
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm">Popular Genres</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Romance", "Fantasy", "Sci-Fi", "Mystery", "Thriller", "Mafia", "Werewolf", "Historical"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setActiveGenre(g)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      activeGenre === g
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ── "Start Writing" full-width banner ─────────────────────── */}
        <div className="mt-10 rounded-2xl overflow-hidden bg-gradient-to-r from-primary via-orange-500 to-amber-500 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent)]" />
          <div className="relative px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-white text-center sm:text-left">
              <h2 className="text-2xl font-bold font-headline">Got a story in your head?</h2>
              <p className="text-white/80 mt-1 text-sm">
                Publish your novel on Novelosity — free tools, real readers, publishing contracts.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button size="lg" asChild className="bg-white text-gray-900 hover:bg-white/90 font-bold shadow-lg">
                <Link href="/author/create-novel">
                  <PenTool className="mr-2 h-4 w-4" /> Start Writing
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/50 text-white hover:bg-white/10">
                <Link href="/browse">Browse Novels</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Quick search tags ──────────────────────────────────────── */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Popular Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Alpha Male", "Second Chance", "Billionaire", "Rejected Mate", "Royal", "Revenge",
              "CEO", "Arranged Marriage", "Forbidden Love", "Time Travel", "Magic System", "Dark Romance"].map((tag) => (
              <Link
                key={tag}
                href={`/browse?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer className="mt-12 pt-8 border-t text-muted-foreground">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Novelosity</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Read</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse" className="hover:text-primary transition-colors">Browse Novels</Link></li>
                <li><Link href="/browse" className="hover:text-primary transition-colors">New Releases</Link></li>
                <li><Link href="/browse" className="hover:text-primary transition-colors">Trending</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Write</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/author/create-novel" className="hover:text-primary transition-colors">Create Novel</Link></li>
                <li><Link href="/author-dashboard" className="hover:text-primary transition-colors">Author Dashboard</Link></li>
                <li><Link href="/tools/chapter-title-generator" className="hover:text-primary transition-colors">AI Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
                <li><Link href="/settings" className="hover:text-primary transition-colors">Settings</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs pt-4 border-t">
            <span>© {new Date().getFullYear()} Novelosity. All rights reserved.</span>
            <span>Your Universe of Stories</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
