"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare, Send, Settings, Sun, Moon, Maximize, Minimize,
  Lock, Coins, Flag, Columns, ThumbsUp, Loader2, BookMarked,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Novel, Chapter } from "@/actions/novels";
import { incrementViews } from "@/actions/novels";
import {
  getComments, addComment, likeComment,
  trackReadingHistory, isChapterUnlocked, unlockChapter,
  isInLibrary, addToLibrary,
} from "@/actions/social";

interface Props {
  novel: Novel;
  chapter: Chapter;
  allChapters: Chapter[];
}

interface DBComment {
  id: number;
  userId: string;
  authorName: string;
  authorPhoto: string | null;
  content: string;
  likes: number;
  createdAt: Date | null;
}

export function ReaderClient({ novel, chapter, allChapters }: Props) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { userProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("font-body");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pageFlipMode, setPageFlipMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [isUnlocked, setIsUnlocked] = useState(!chapter.isPaid);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<DBComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [inLibrary, setInLibrary] = useState(false);

  // Persist theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Track fullscreen
  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Increment views + track reading history
  useEffect(() => {
    incrementViews(novel.id);
    if (isSignedIn) {
      trackReadingHistory(
        novel.id,
        chapter.id,
        novel.title,
        chapter.title,
        novel.coverImageUrl
      ).catch(() => {});
    }
  }, [novel.id, chapter.id, novel.title, chapter.title, novel.coverImageUrl, isSignedIn]);

  // Check if paid chapter already unlocked
  useEffect(() => {
    if (!chapter.isPaid) { setIsUnlocked(true); return; }
    if (!isSignedIn) { setIsUnlocked(false); return; }
    isChapterUnlocked(chapter.id).then(setIsUnlocked);
  }, [chapter.id, chapter.isPaid, isSignedIn]);

  // Load comments
  useEffect(() => {
    setLoadingComments(true);
    getComments(chapter.id)
      .then((rows) => setComments(rows as DBComment[]))
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [chapter.id]);

  // Check library status
  useEffect(() => {
    if (isSignedIn) isInLibrary(novel.id).then(setInLibrary);
  }, [isSignedIn, novel.id]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const navigate = (chapterNumber: number) => {
    router.push(`/reader/${novel.id}/chapter-${chapterNumber}`);
  };

  const currentIndex = allChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const handleUnlock = async () => {
    if (!isSignedIn) { toast({ title: "Sign in to unlock chapters" }); return; }
    const coinBalance = userProfile?.coins ?? 0;
    if (coinBalance < chapter.coinCost) {
      toast({
        title: "Insufficient coins",
        description: `You need ${chapter.coinCost} coins but only have ${coinBalance}. Buy more from your profile.`,
        variant: "destructive",
      });
      return;
    }
    setIsUnlocking(true);
    try {
      await unlockChapter(chapter.id, novel.id, chapter.coinCost);
      setIsUnlocked(true);
      await refreshProfile();
      toast({ title: "Chapter unlocked!", description: `${chapter.coinCost} coins spent.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to unlock chapter";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isSignedIn) { toast({ title: "Sign in to comment" }); return; }
    setSubmittingComment(true);
    try {
      const row = await addComment(chapter.id, newComment);
      setComments((prev) => [row as DBComment, ...prev]);
      setNewComment("");
    } catch {
      toast({ title: "Failed to post comment", variant: "destructive" });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async (commentId: number) => {
    await likeComment(commentId);
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const handleAddToLibrary = () => {
    if (!isSignedIn) { toast({ title: "Sign in to save books" }); return; }
    startTransition(async () => {
      await addToLibrary(novel.id, novel.title, novel.coverImageUrl, novel.authorName);
      setInLibrary(true);
      toast({ title: "Added to library!" });
    });
  };

  return (
    <div className={`${fontFamily} flex flex-col h-full`}>
      <div className="container mx-auto py-4 md:py-8 flex flex-col flex-1">

        {/* Toolbar */}
        <Card className="mb-4 md:mb-8 shadow-md sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)} aria-label="Settings">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleFullScreen} aria-label="Toggle fullscreen">
                {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              {!inLibrary && (
                <Button variant="outline" size="icon" onClick={handleAddToLibrary} disabled={isPending} aria-label="Add to library">
                  <BookMarked className="h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {prevChapter && (
                <Button variant="outline" onClick={() => navigate(prevChapter.chapterNumber)}>Prev</Button>
              )}
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Chapter {chapter.chapterNumber} of {allChapters.length}
              </span>
              {nextChapter && (
                <Button variant="default" onClick={() => navigate(nextChapter.chapterNumber)}>Next</Button>
              )}
            </div>
          </CardContent>

          {showSettings && (
            <CardFooter className="p-3 md:p-4 border-t flex flex-col md:flex-row gap-4 md:items-end flex-wrap">
              <div className="flex-1 min-w-[150px] space-y-2">
                <Label className="text-xs">Font Size: {fontSize}px</Label>
                <Slider min={12} max={32} step={1} defaultValue={[fontSize]} onValueChange={(v) => setFontSize(v[0])} />
              </div>
              <div className="flex-1 min-w-[150px] space-y-2">
                <Label className="text-xs">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="font-body">PT Sans</SelectItem>
                    <SelectItem value="font-headline">Playfair Display</SelectItem>
                    <SelectItem value="font-sans">System Sans-Serif</SelectItem>
                    <SelectItem value="font-serif">System Serif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-4 md:pt-0 md:self-end">
                <Switch id="page-flip" checked={pageFlipMode} onCheckedChange={setPageFlipMode} />
                <Label htmlFor="page-flip" className="text-xs flex items-center gap-1">
                  <Columns className="h-3 w-3" /> Page Flip Mode
                </Label>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Chapter content */}
        <Card className="shadow-lg flex flex-col flex-1 overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-headline">{chapter.title}</CardTitle>
            <CardDescription>
              From &ldquo;{novel.title}&rdquo; &mdash; Chapter {chapter.chapterNumber}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="py-6 md:py-8 flex flex-col flex-1 overflow-hidden">
            {chapter.isPaid && !isUnlocked ? (
              <div className="text-center py-10 flex flex-col items-center justify-center flex-1">
                <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-headline mb-2">This Chapter is Locked</h3>
                <p className="text-muted-foreground mb-2">Unlock this chapter to continue reading.</p>
                {isSignedIn && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Your balance: <strong>{userProfile?.coins ?? 0} coins</strong>
                  </p>
                )}
                <Button onClick={handleUnlock} size="lg" disabled={isUnlocking}>
                  {isUnlocking ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Unlocking…</>
                  ) : (
                    <><Coins className="mr-2 h-5 w-5" /> Unlock with {chapter.coinCost} Coins</>
                  )}
                </Button>
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                <article
                  style={{ fontSize: `${fontSize}px` }}
                  className="prose dark:prose-invert prose-lg max-w-none mx-auto leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: chapter.content ?? "" }}
                />
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <section className="mt-8 md:mt-12">
          <h2 className="text-2xl md:text-3xl font-headline mb-6 flex items-center">
            <MessageSquare className="h-7 w-7 mr-3 text-primary" /> Reader Comments
            {!loadingComments && <span className="ml-2 text-lg text-muted-foreground">({comments.length})</span>}
          </h2>
          <Card className="shadow-md">
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
                <Textarea
                  placeholder={isSignedIn ? "Share your thoughts on this chapter..." : "Sign in to comment…"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="flex-grow"
                  disabled={!isSignedIn || submittingComment}
                />
                <Button type="submit" size="icon" aria-label="Post comment" disabled={!isSignedIn || submittingComment || !newComment.trim()}>
                  {submittingComment ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </form>
              <Separator className="mb-6" />
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.length > 0 ? (
                    comments.map((c) => (
                      <div key={c.id} className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={c.authorPhoto ?? ""} />
                          <AvatarFallback>{c.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm">{c.authorName}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                onClick={() => handleLike(c.id)}
                                aria-label="Like comment"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </Button>
                              {c.likes > 0 && <span className="text-xs text-muted-foreground">{c.likes}</span>}
                            </div>
                          </div>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No comments yet. Be the first!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
