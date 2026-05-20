"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen, Star, Eye, Users, BookMarked, Heart, Lock, Coins,
  ChevronDown, ChevronUp, Send, ThumbsUp,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import type { Novel, Chapter } from "@/actions/novels";
import {
  isInLibrary, addToLibrary, removeFromLibrary,
  isFollowingNovel, followNovel, unfollowNovel,
  upsertReview,
} from "@/actions/social";

interface Review {
  id: number;
  userId: string;
  authorName: string;
  rating: number;
  content: string | null;
  createdAt: Date | null;
}

interface Props {
  novel: Novel;
  chapters: Chapter[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-5 w-5 transition-colors ${
            (onChange ? (hovered || value) >= n : value >= n)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground"
          } ${onChange ? "cursor-pointer" : ""}`}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange?.(n)}
        />
      ))}
    </div>
  );
}

export function NovelDetailClient({ novel, chapters, reviews: initialReviews, averageRating, reviewCount }: Props) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [inLibrary, setInLibrary] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);
  const [myRating, setMyRating] = useState(0);
  const [myReviewText, setMyReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    isInLibrary(novel.id).then(setInLibrary);
    isFollowingNovel(novel.id).then(setFollowing);
  }, [isSignedIn, novel.id]);

  const toggleLibrary = () => {
    if (!isSignedIn) { toast({ title: "Sign in to save books" }); return; }
    startTransition(async () => {
      if (inLibrary) {
        await removeFromLibrary(novel.id);
        setInLibrary(false);
        toast({ title: "Removed from library" });
      } else {
        await addToLibrary(novel.id, novel.title, novel.coverImageUrl, novel.authorName);
        setInLibrary(true);
        toast({ title: "Added to library!" });
      }
    });
  };

  const toggleFollow = () => {
    if (!isSignedIn) { toast({ title: "Sign in to follow" }); return; }
    startTransition(async () => {
      if (following) {
        await unfollowNovel(novel.id);
        setFollowing(false);
        toast({ title: "Unfollowed" });
      } else {
        await followNovel(novel.id);
        setFollowing(true);
        toast({ title: "Following! You'll get new chapter alerts." });
      }
    });
  };

  const submitReview = async () => {
    if (!isSignedIn) { toast({ title: "Sign in to review" }); return; }
    if (myRating === 0) { toast({ title: "Please select a rating" }); return; }
    setSubmittingReview(true);
    try {
      await upsertReview(novel.id, myRating, myReviewText);
      // Refresh reviews
      const { getNovelReviews } = await import("@/actions/social");
      const updated = await getNovelReviews(novel.id);
      setReviews(updated as Review[]);
      setShowReviewForm(false);
      toast({ title: "Review submitted!" });
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  };

  const displayedChapters = showAllChapters ? chapters : chapters.slice(0, 10);
  const tags = (novel.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="shrink-0 mx-auto md:mx-0">
          <div className="relative w-48 h-72 rounded-lg overflow-hidden shadow-xl">
            <Image
              src={novel.coverImageUrl || "https://placehold.co/300x450.png"}
              alt={novel.title}
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-headline text-primary mb-1">{novel.title}</h1>
          <p className="text-muted-foreground mb-3">
            by{" "}
            <Link href={`/authors/${novel.authorId}`} className="font-semibold hover:underline text-foreground">
              {novel.authorName}
            </Link>
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {novel.genre && <Badge variant="secondary">{novel.genre}</Badge>}
            <Badge variant="outline">{novel.contentRating}</Badge>
            <Badge variant={novel.status === "published" ? "default" : "outline"} className="capitalize">
              {novel.status === "published" ? "Ongoing" : novel.status}
            </Badge>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating value={Math.round(averageRating)} />
            <span className="text-sm text-muted-foreground">
              {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}{" "}
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {novel.views.toLocaleString()} views</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {novel.subscribers.toLocaleString()} followers</span>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {novel.chapterCount} chapters</span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag) => (
                <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full capitalize">{tag}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {chapters.length > 0 ? (
              <Button asChild size="lg" className="bg-primary">
                <Link href={`/reader/${novel.id}/chapter-1`}>
                  <BookOpen className="mr-2 h-5 w-5" /> Read Now
                </Link>
              </Button>
            ) : (
              <Button size="lg" disabled>No chapters yet</Button>
            )}
            <Button
              variant={inLibrary ? "default" : "outline"}
              onClick={toggleLibrary}
              disabled={isPending}
            >
              <BookMarked className="mr-2 h-4 w-4" />
              {inLibrary ? "In Library" : "Add to Library"}
            </Button>
            <Button
              variant={following ? "default" : "outline"}
              onClick={toggleFollow}
              disabled={isPending}
            >
              <Heart className={`mr-2 h-4 w-4 ${following ? "fill-current" : ""}`} />
              {following ? "Following" : "Follow"}
            </Button>
          </div>
        </div>
      </div>

      {/* Synopsis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Synopsis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {novel.synopsis || "No synopsis available."}
          </p>
        </CardContent>
      </Card>

      {/* Chapters list */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Chapters ({chapters.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {chapters.length === 0 ? (
            <p className="p-6 text-muted-foreground text-center">No chapters published yet.</p>
          ) : (
            <>
              <div className="divide-y">
                {displayedChapters.map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/reader/${novel.id}/${ch.id}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-muted-foreground w-8 shrink-0">
                        Ch.{ch.chapterNumber}
                      </span>
                      <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {ch.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {ch.wordCount.toLocaleString()} words
                      </span>
                      {ch.isPaid ? (
                        <Badge variant="secondary" className="bg-amber-500 text-white text-xs px-1.5">
                          <Coins className="h-3 w-3 mr-1" />{ch.coinCost}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-600 text-xs px-1.5">Free</Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {chapters.length > 10 && (
                <div className="p-4 text-center border-t">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllChapters(!showAllChapters)}
                  >
                    {showAllChapters ? (
                      <><ChevronUp className="mr-2 h-4 w-4" /> Show Less</>
                    ) : (
                      <><ChevronDown className="mr-2 h-4 w-4" /> Show All {chapters.length} Chapters</>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Reviews ({reviews.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!isSignedIn) { toast({ title: "Sign in to write a review" }); return; }
              setShowReviewForm(!showReviewForm);
            }}
          >
            Write a Review
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {showReviewForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="space-y-1">
                <p className="text-sm font-medium">Your Rating</p>
                <StarRating value={myRating} onChange={setMyRating} />
              </div>
              <Textarea
                placeholder="Share your thoughts about this novel..."
                value={myReviewText}
                onChange={(e) => setMyReviewText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                <Button size="sm" onClick={submitReview} disabled={submittingReview}>
                  {submittingReview ? "Submitting…" : "Submit Review"}
                </Button>
              </div>
            </div>
          )}

          {reviews.length === 0 && !showReviewForm ? (
            <p className="text-center text-muted-foreground py-4">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="flex gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback>{rev.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{rev.authorName}</span>
                      <StarRating value={rev.rating} />
                    </div>
                    {rev.content && <p className="text-sm text-muted-foreground">{rev.content}</p>}
                    {rev.createdAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
