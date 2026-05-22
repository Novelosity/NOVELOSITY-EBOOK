
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bold, Italic, PlusCircle, Facebook, Twitter, Link as LinkIcon,
  MoreHorizontal, Save, Edit3, Trash2, Eye, DollarSign, FileText,
  Settings2, CheckCircle2, Menu, X, AlertCircle,
} from "lucide-react";
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import ClientRoleProtector from "@/components/ClientRoleProtector";
import {
  getChapters, createChapter, updateChapter,
  deleteChapter as deleteChapterFS, getNovel,
} from "@/actions/novels";
import { recordWritingSession } from "@/actions/writing";
import { useToast } from "@/hooks/use-toast";

interface Chapter {
  id: string;
  title: string;
  words: number;
  date: string;
  content: string;
  authorNote: string;
  isPaid?: boolean;
  coinCost?: number;
}

function WriteChapterContent() {
  const params = useParams();
  const novelId = params.novelId as string;
  const { toast } = useToast();

  const [novelTitle, setNovelTitle] = useState("My Novel");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditTitleOpen, setIsEditTitleOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refs — stable across renders, safe to read in cleanup/beacon callbacks
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Snapshot of the chapter currently being edited — kept in sync for save-on-exit */
  const pendingSaveRef = useRef<{
    chapterId: string;
    content: string;
    wordCount: number;
    authorNote: string;
  } | null>(null);
  /** Per-chapter last-persisted word count — used to compute deltas for writing sessions */
  const lastSavedWordsRef = useRef<Record<string, number>>({});
  /** Mirrors hasUnsavedChanges state without stale-closure issues in cleanup effects */
  const hasUnsavedRef = useRef(false);
  const novelTitleRef = useRef(novelTitle);
  useEffect(() => { novelTitleRef.current = novelTitle; }, [novelTitle]);

  // ── Load novel + chapters ──────────────────────────────────────────────────
  useEffect(() => {
    if (!novelId) return;
    setLoadingChapters(true);
    Promise.all([getNovel(Number(novelId)), getChapters(Number(novelId))])
      .then(([novel, fetched]) => {
        if (novel) setNovelTitle(novel.title);
        const mapped: Chapter[] = fetched.map((ch) => ({
          id: String(ch.id ?? ''),
          title: ch.title,
          words: ch.wordCount,
          date: ch.updatedAt
            ? new Date(ch.updatedAt as Date).toLocaleString()
            : 'Unpublished',
          content: ch.content ?? '',
          authorNote: ch.authorNote ?? '',
          isPaid: ch.isPaid,
          coinCost: ch.coinCost,
        }));
        // Seed last-saved word counts so first auto-save doesn't double-count
        mapped.forEach((ch) => {
          lastSavedWordsRef.current[ch.id] = ch.words;
        });
        setChapters(mapped);
        if (mapped.length > 0) {
          const first = mapped[0];
          setSelectedChapterId(first.id);
          setChapterContent(first.content);
          setNoteContent(first.authorNote);
          setCurrentWordCount(first.words);
        }
      })
      .catch((err) => {
        console.error(err);
        toast({ title: "Error", description: "Failed to load chapters.", variant: "destructive" });
      })
      .finally(() => setLoadingChapters(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novelId]);

  // ── Keep pending-save snapshot in sync ────────────────────────────────────
  useEffect(() => {
    if (!selectedChapterId || selectedChapterId.startsWith('new_')) {
      pendingSaveRef.current = null;
      return;
    }
    pendingSaveRef.current = {
      chapterId: selectedChapterId,
      content: chapterContent,
      wordCount: currentWordCount,
      authorNote: noteContent,
    };
  }, [selectedChapterId, chapterContent, noteContent, currentWordCount]);

  // ── Save on browser close / tab refresh (sendBeacon) ─────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const data = pendingSaveRef.current;
      if (!data || !hasUnsavedRef.current) return;
      // Best-effort beacon — no guarantee, but survives hard navigation
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon('/api/chapters/save', blob);
      // Show browser's "Leave site?" prompt so the user has a chance to wait
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // ── Save on Next.js soft-navigation (component unmount) ───────────────────
  useEffect(() => {
    return () => {
      const data = pendingSaveRef.current;
      if (!data || !hasUnsavedRef.current) return;
      // keepalive: true lets the fetch complete even as the page navigates away
      fetch('/api/chapters/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {});
    };
  }, []);

  // ── Word count ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setCurrentWordCount(chapterContent.split(/\s+/).filter(Boolean).length);
  }, [chapterContent]);

  // ── Auto-save (3 s after user stops typing) ───────────────────────────────
  useEffect(() => {
    if (!selectedChapterId || selectedChapterId.startsWith('new_') || !novelId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    const idSnap = selectedChapterId;
    const contentSnap = chapterContent;
    const noteSnap = noteContent;
    const wcSnap = contentSnap.split(/\s+/).filter(Boolean).length;
    const prevWords = lastSavedWordsRef.current[idSnap] ?? 0;
    const novelIdNum = Number(novelId);

    autoSaveTimerRef.current = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await updateChapter(Number(idSnap), {
          content: contentSnap,
          wordCount: wcSnap,
          authorNote: noteSnap,
        });
        // Track writing session delta
        const delta = wcSnap - prevWords;
        if (delta > 0) {
          recordWritingSession(novelIdNum, novelTitleRef.current, delta).catch(() => {});
        }
        lastSavedWordsRef.current[idSnap] = wcSnap;
        setChapters((prev) =>
          prev.map((ch) =>
            ch.id === idSnap
              ? { ...ch, content: contentSnap, words: wcSnap, authorNote: noteSnap }
              : ch,
          ),
        );
        hasUnsavedRef.current = false;
        setHasUnsavedChanges(false);
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2500);
      } catch (err) {
        console.error('Auto-save failed:', err);
        toast({
          title: "Auto-save failed",
          description: "Could not save automatically. Please save manually.",
          variant: "destructive",
        });
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterContent, noteContent]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

  const handleSelectChapter = useCallback(
    (chapterId: string) => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      setSelectedChapterId(chapterId);
      const ch = chapters.find((c) => c.id === chapterId);
      if (ch) {
        setChapterContent(ch.content);
        setNoteContent(ch.authorNote);
        setCurrentWordCount(ch.words);
      }
      setHasUnsavedChanges(false);
      hasUnsavedRef.current = false;
      setSidebarOpen(false);
    },
    [chapters],
  );

  const markUnsaved = () => {
    setHasUnsavedChanges(true);
    hasUnsavedRef.current = true;
  };

  const openEditTitle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingTitle(selectedChapter?.title ?? '');
    setIsEditTitleOpen(true);
  };

  const handleSaveTitle = async () => {
    const trimmed = editingTitle.trim();
    if (!trimmed || !selectedChapterId) return;
    try {
      if (!selectedChapterId.startsWith('new_')) {
        await updateChapter(Number(selectedChapterId), { title: trimmed });
      }
      setChapters((prev) =>
        prev.map((ch) => (ch.id === selectedChapterId ? { ...ch, title: trimmed } : ch)),
      );
      setIsEditTitleOpen(false);
      toast({ title: "Title updated!" });
    } catch {
      toast({ title: "Error", description: "Failed to update title.", variant: "destructive" });
    }
  };

  /** Manual save — also records writing session delta */
  const handleSave = async () => {
    if (!selectedChapterId || !novelId) return;
    setIsSaving(true);
    try {
      if (selectedChapterId.startsWith('new_')) {
        const newChap = await createChapter({
          novelId: Number(novelId),
          title: selectedChapter?.title || 'Untitled Chapter',
          content: chapterContent,
          chapterNumber: chapters.length,
          isPaid: selectedChapter?.isPaid ?? false,
          coinCost: selectedChapter?.coinCost ?? 0,
          wordCount: currentWordCount,
          authorNote: noteContent,
        });
        const newId = String(newChap.id);
        // Record all words as new (first save)
        if (currentWordCount > 0) {
          recordWritingSession(Number(novelId), novelTitle, currentWordCount).catch(() => {});
        }
        lastSavedWordsRef.current[newId] = currentWordCount;
        setChapters((prev) =>
          prev.map((ch) =>
            ch.id === selectedChapterId
              ? { ...ch, id: newId, words: currentWordCount, authorNote: noteContent }
              : ch,
          ),
        );
        setSelectedChapterId(newId);
      } else {
        await updateChapter(Number(selectedChapterId), {
          content: chapterContent,
          wordCount: currentWordCount,
          authorNote: noteContent,
        });
        const delta =
          currentWordCount - (lastSavedWordsRef.current[selectedChapterId] ?? 0);
        if (delta > 0) {
          recordWritingSession(Number(novelId), novelTitle, delta).catch(() => {});
        }
        lastSavedWordsRef.current[selectedChapterId] = currentWordCount;
        setChapters((prev) =>
          prev.map((ch) =>
            ch.id === selectedChapterId
              ? { ...ch, content: chapterContent, words: currentWordCount, authorNote: noteContent }
              : ch,
          ),
        );
      }
      hasUnsavedRef.current = false;
      pendingSaveRef.current = null;
      setHasUnsavedChanges(false);
      toast({ title: "Chapter saved!" });
    } catch (err) {
      console.error('Save failed:', err);
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishChapter = async () => {
    if (!selectedChapterId || selectedChapterId.startsWith('new_')) {
      toast({ title: "Save first", description: "Save the chapter before publishing.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await updateChapter(Number(selectedChapterId), { status: 'published' });
      toast({ title: "Chapter published!", description: "Readers can now see this chapter." });
    } catch {
      toast({ title: "Error", description: "Failed to publish.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewChapter = () => {
    const newId = `new_${Date.now()}`;
    setChapters((prev) => [
      ...prev,
      { id: newId, title: 'Untitled Chapter', words: 0, date: 'Unpublished', content: '', authorNote: '', isPaid: false },
    ]);
    setSelectedChapterId(newId);
    setChapterContent('');
    setNoteContent('');
    setCurrentWordCount(0);
    setHasUnsavedChanges(false);
    hasUnsavedRef.current = false;
    setSidebarOpen(false);
  };

  const handleChapterOption = async (option: string, chapterId: string) => {
    const title = chapters.find((c) => c.id === chapterId)?.title || 'Chapter';
    if (option === 'Edit Details') {
      setSelectedChapterId(chapterId);
      setEditingTitle(chapters.find((c) => c.id === chapterId)?.title ?? '');
      setIsEditTitleOpen(true);
      return;
    }
    if (option === 'setPricing') {
      const ch = chapters.find((c) => c.id === chapterId);
      const newIsPaid = !ch?.isPaid;
      try {
        if (!chapterId.startsWith('new_'))
          await updateChapter(Number(chapterId), { isPaid: newIsPaid, coinCost: newIsPaid ? 10 : 0 });
        setChapters((prev) =>
          prev.map((c) =>
            c.id === chapterId
              ? { ...c, isPaid: newIsPaid, coinCost: newIsPaid ? (c.coinCost || 10) : 0 }
              : c,
          ),
        );
      } catch {
        toast({ title: "Error", description: "Failed to update pricing.", variant: "destructive" });
      }
    } else if (option === 'delete') {
      if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
      try {
        if (!chapterId.startsWith('new_')) await deleteChapterFS(Number(chapterId));
        setChapters((prev) => {
          const updated = prev.filter((c) => c.id !== chapterId);
          if (selectedChapterId === chapterId) {
            const next = updated[0];
            if (next) {
              setSelectedChapterId(next.id);
              setChapterContent(next.content);
              setNoteContent(next.authorNote);
            } else {
              setSelectedChapterId('');
              setChapterContent('');
              setNoteContent('');
            }
          }
          return updated;
        });
        toast({ title: "Chapter deleted" });
      } catch {
        toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
      }
    } else if (option === 'publish') {
      await handlePublishChapter();
    }
  };

  const copyLink = () =>
    navigator.clipboard.writeText(window.location.href).then(() =>
      toast({ title: "Link copied!" }),
    );

  // ── Sidebar panel (shared) ────────────────────────────────────────────────
  const sidebarPanel = (
    <>
      <div className="p-3 border-b shrink-0">
        <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white" onClick={handleNewChapter}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Chapter
        </Button>
      </div>
      <div className="p-3 border-b shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Share</p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}>
            <Facebook className="h-4 w-4 text-blue-600" />
          </Button>
          <Button variant="outline" size="icon"
            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(novelTitle)}`, '_blank')}>
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={copyLink}>
            <LinkIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {loadingChapters ? (
            <p className="p-4 text-center text-muted-foreground text-sm">Loading…</p>
          ) : chapters.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground text-sm">
              No chapters yet. Click "New Chapter" to start!
            </p>
          ) : (
            chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-muted/80 transition-colors ${
                  selectedChapterId === chapter.id ? 'bg-muted shadow-sm' : ''
                }`}
                onClick={() => handleSelectChapter(chapter.id)}
              >
                <div className="flex items-center gap-1">
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-semibold text-sm truncate ${
                        selectedChapterId === chapter.id ? 'text-primary' : ''
                      }`}
                    >
                      {chapter.title}
                      {selectedChapterId === chapter.id && hasUnsavedChanges && (
                        <span className="ml-1 text-amber-500 text-xs">●</span>
                      )}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {chapter.isPaid ? (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-amber-500 text-white">
                          <DollarSign className="h-3 w-3 mr-0.5" /> {chapter.coinCost || 0} Coins
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 border-green-500 text-green-600">
                          Free
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => handleChapterOption('Edit Details', chapter.id)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Title
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChapterOption('setPricing', chapter.id)}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        {chapter.isPaid ? 'Make Free' : 'Set Pricing'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChapterOption('publish', chapter.id)}>
                        <Settings2 className="mr-2 h-4 w-4" /> Publish
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => handleChapterOption('delete', chapter.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {chapter.words.toLocaleString()} words ·{' '}
                  {chapter.date !== 'Unpublished' ? chapter.date.split(' ')[0] : 'Unpublished'}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 border-r flex-col shrink-0 bg-background">
        {sidebarPanel}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-72 flex flex-col bg-background border-r h-full shadow-xl">
            <div className="flex items-center justify-between p-3 border-b shrink-0">
              <span className="font-semibold text-sm">Chapters</span>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebarPanel}
          </aside>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {selectedChapter ? (
          <Card className="flex-1 flex flex-col rounded-none border-0 shadow-none overflow-hidden">
            <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">

              {/* Header */}
              <div className="px-3 py-2 border-b flex items-center gap-2 bg-muted/30 shrink-0">
                <Button
                  variant="ghost" size="icon"
                  className="md:hidden shrink-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <h2
                    className="text-base sm:text-lg font-headline text-primary truncate cursor-pointer hover:underline"
                    onClick={openEditTitle}
                    title="Click to edit title"
                  >
                    {selectedChapter.title}
                  </h2>
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground"
                    onClick={openEditTitle}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  {/* Save status indicators */}
                  {isAutoSaving && (
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">Saving…</span>
                  )}
                  {autoSaved && !isAutoSaving && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-green-600 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Auto-saved
                    </span>
                  )}
                  {hasUnsavedChanges && !isAutoSaving && !autoSaved && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-amber-500 shrink-0">
                      <AlertCircle className="h-3.5 w-3.5" /> Unsaved
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={openEditTitle}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit Title
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePublishChapter}>
                      <Settings2 className="mr-2 h-4 w-4" /> Publish Chapter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Formatting toolbar */}
              <div className="px-2 py-1 border-b flex items-center gap-1 bg-muted/20 shrink-0">
                <Button
                  variant="ghost" size="icon" className="h-8 w-8" title="Bold"
                  onClick={() => {
                    const sel = window.getSelection()?.toString();
                    if (sel) setChapterContent((p) => p.replace(sel, `**${sel}**`));
                  }}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8" title="Italic"
                  onClick={() => {
                    const sel = window.getSelection()?.toString();
                    if (sel) setChapterContent((p) => p.replace(sel, `_${sel}_`));
                  }}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </div>

              {/* Content textarea */}
              <div className="flex-1 overflow-auto">
                <Textarea
                  value={chapterContent}
                  onChange={(e) => {
                    setChapterContent(e.target.value);
                    markUnsaved();
                  }}
                  placeholder="Start writing your chapter here…"
                  className="w-full h-full min-h-[200px] p-4 sm:p-6 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none rounded-none"
                />
              </div>

              {/* Author note */}
              <div className="px-3 py-3 border-t bg-muted/10 shrink-0">
                <label htmlFor="author-note" className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Author Note{' '}
                  <span className="text-muted-foreground/60">(optional — saved with chapter)</span>
                </label>
                <Textarea
                  id="author-note"
                  value={noteContent}
                  onChange={(e) => {
                    setNoteContent(e.target.value);
                    markUnsaved();
                  }}
                  placeholder="Share a note with your readers for this chapter (max 1500 characters)."
                  rows={2}
                  maxLength={1500}
                  className="w-full text-sm resize-none focus-visible:ring-1"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{noteContent.length} / 1500</p>
              </div>

              {/* Footer */}
              <div className="px-3 py-3 border-t flex flex-col sm:flex-row justify-between items-center gap-3 bg-muted/30 shrink-0">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  <span className="font-medium">{currentWordCount.toLocaleString()}</span> words
                  <span className="text-muted-foreground/60 ml-1.5 text-xs">(ideal: 600–1000)</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => toast({ title: "Preview coming soon." })}
                  >
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
            <Button variant="outline" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="mr-2 h-4 w-4" /> View Chapters
            </Button>
            <FileText className="h-14 w-14 text-muted-foreground" />
            <h2 className="text-xl font-headline">No Chapter Selected</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Select a chapter from the list, or create a new one to start writing.
            </p>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={handleNewChapter}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Chapter
            </Button>
          </div>
        )}
      </div>

      {/* Edit Title Dialog */}
      <Dialog open={isEditTitleOpen} onOpenChange={setIsEditTitleOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Edit Chapter Title</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="chapter-title-input">Chapter Title</Label>
            <Input
              id="chapter-title-input"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); }}
              placeholder="Enter chapter title…"
              autoFocus
            />
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveTitle} disabled={!editingTitle.trim()}>
              Save Title
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WriteChapterPage() {
  return (
    <ClientRoleProtector allowedRoles={["author"]} pageTitle="Write Chapters">
      <WriteChapterContent />
    </ClientRoleProtector>
  );
}
