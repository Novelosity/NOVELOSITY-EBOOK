
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Bold, Italic, PlusCircle, Facebook, Twitter, Link as LinkIcon, MoreHorizontal, Save, Edit3, Trash2, Eye, DollarSign, FileText, Settings2, CheckCircle2
} from "lucide-react";
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import ClientRoleProtector from "@/components/ClientRoleProtector";
import { getChapters, createChapter, updateChapter, deleteChapter as deleteChapterFS, getNovel } from "@/actions/novels";
import { useToast } from "@/hooks/use-toast";

const initialMockNovelTitle = "The Crimson Labyrinth";
interface Chapter {
  id: string;
  title: string;
  words: number;
  date: string;
  content: string;
  isPaid?: boolean; 
  coinCost?: number;
}

const initialMockChapters: Chapter[] = [
  { id: "ch1", title: "The Alpha Rebellion", words: 1093, date: "2025-06-01 15:52:18", content: "For the first time, the smile that touched her face was not hesitant.\nNot performative.\nIt was sovereign.\nThey stood at the edge of a broken world, the fire still crackling in the sky above, the ashes of the old world cooling beneath their boots.\nFire crowned.\nHearts whole.\nReady.\nElara Moonstone was no longer the girl the world tried to silence.\nShe was the queen, she could not deny.\nA queen not born of bloodline.\nNot chosen by council.\nNot forged by fate.\nBut crowned in fire.\nAnd fire, once lit, could never again be caged.", isPaid: false },
  { id: "ch2", title: "The Trial of Three Moons", words: 1101, date: "2025-06-01 15:54:22", content: "Content for Trial of Three Moons...", isPaid: true, coinCost: 10 },
  { id: "ch3", title: "Trial One: The Mirror of Truth", words: 1084, date: "2025-06-01 15:57:03", content: "Content for Mirror of Truth...", isPaid: false },
  { id: "ch4", title: "Crowned by Fire", words: 1144, date: "2025-06-01 16:15:31", content: "More content for Crowned by Fire...", isPaid: true, coinCost: 15 },
  { id: "ch5", title: "Untitled Chapter", words: 0, date: "Unpublished", content: "", isPaid: false },
];

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
  const [noteWordCount, setNoteWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [isEditTitleOpen, setIsEditTitleOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load novel info and chapters
  useEffect(() => {
    if (!novelId) return;
    setLoadingChapters(true);
    Promise.all([getNovel(Number(novelId)), getChapters(Number(novelId))])
      .then(([novel, fetchedChapters]) => {
        if (novel) setNovelTitle(novel.title);
        const mapped: Chapter[] = fetchedChapters.map((ch) => ({
          id: String(ch.id ?? ''),
          title: ch.title,
          words: ch.wordCount,
          date: ch.updatedAt ? new Date(ch.updatedAt as Date).toLocaleString() : 'Unpublished',
          content: ch.content,
          isPaid: ch.isPaid,
          coinCost: ch.coinCost,
        }));
        setChapters(mapped);
        if (mapped.length > 0) setSelectedChapterId(mapped[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingChapters(false));
  }, [novelId]);

  const selectedChapter = chapters.find(c => c.id === selectedChapterId);
  
  const getChapterContent = useCallback((chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? chapter.content : "Chapter content not found.";
  }, [chapters]);

  useEffect(() => {
    if (selectedChapter) {
      // Document title is set by ClientRoleProtector
    } else if (novelId) {
      // Document title is set by ClientRoleProtector
    }
  }, [selectedChapter, novelId]);

  useEffect(() => {
    if (selectedChapterId) {
      const content = getChapterContent(selectedChapterId);
      setChapterContent(content);
      setCurrentWordCount(content.split(/\s+/).filter(Boolean).length);
    } else {
      setChapterContent("");
      setCurrentWordCount(0);
    }
  }, [selectedChapterId, getChapterContent]);

  useEffect(() => {
    setCurrentWordCount(chapterContent.split(/\s+/).filter(Boolean).length);
  }, [chapterContent]);

  useEffect(() => {
    setNoteWordCount(noteContent.split(/\s+/).filter(Boolean).length);
  }, [noteContent]);

  // Auto-save: fires 3 s after the user stops typing (existing chapters only)
  useEffect(() => {
    if (!selectedChapterId || selectedChapterId.startsWith('new_') || !novelId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await updateChapter(Number(selectedChapterId), {
          content: chapterContent,
          wordCount: currentWordCount,
        });
        setChapters(prev =>
          prev.map(ch =>
            ch.id === selectedChapterId ? { ...ch, content: chapterContent, words: currentWordCount } : ch
          )
        );
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      } catch {
        // silent — user can still manually save
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterContent]);

  const openEditTitle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingTitle(selectedChapter?.title ?? "");
    setIsEditTitleOpen(true);
  };

  const handleSaveTitle = async () => {
    const trimmed = editingTitle.trim();
    if (!trimmed || !selectedChapterId) return;
    if (!selectedChapterId.startsWith('new_')) {
      await updateChapter(Number(selectedChapterId), { title: trimmed });
    }
    setChapters(prev =>
      prev.map(ch => ch.id === selectedChapterId ? { ...ch, title: trimmed } : ch)
    );
    setIsEditTitleOpen(false);
    toast({ title: "Chapter title updated!" });
  };

  const handleSave = async () => {
    if (!selectedChapterId || !novelId) return;
    setIsSaving(true);
    try {
      // Check if this is a new (unsaved) chapter
      if (selectedChapterId.startsWith('new_')) {
        const newChap = await createChapter({
          novelId: Number(novelId),
          title: selectedChapter?.title || 'Untitled Chapter',
          content: chapterContent,
          chapterNumber: chapters.length,
          isPaid: selectedChapter?.isPaid ?? false,
          coinCost: selectedChapter?.coinCost ?? 0,
          wordCount: currentWordCount,
        });
        setChapters(prev => prev.map(ch => ch.id === selectedChapterId ? { ...ch, id: String(newChap.id), words: currentWordCount } : ch));
        setSelectedChapterId(String(newChap.id));
      } else {
        await updateChapter(Number(selectedChapterId), {
          content: chapterContent,
          wordCount: currentWordCount,
        });
        setChapters(prev => prev.map(ch => ch.id === selectedChapterId ? { ...ch, content: chapterContent, words: currentWordCount } : ch));
      }
      toast({ title: "Chapter saved!" });
    } catch {
      toast({ title: "Error", description: "Failed to save chapter.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishChapter = async () => {
    if (!selectedChapterId || selectedChapterId.startsWith('new_') || !novelId) {
      toast({ title: "Save first", description: "Please save the chapter before publishing.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await updateChapter(Number(selectedChapterId), { status: 'published' });
      toast({ title: "Chapter published!", description: "Readers can now see this chapter." });
    } catch {
      toast({ title: "Error", description: "Failed to publish chapter.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewChapter = () => {
    const newChapterId = `new_${Date.now()}`;
    const newChapter: Chapter = {
      id: newChapterId,
      title: "Untitled Chapter",
      words: 0,
      date: "Unpublished",
      content: "",
      isPaid: false,
    };
    setChapters(prev => [...prev, newChapter]);
    setSelectedChapterId(newChapterId);
    setChapterContent("");
    setNoteContent("");
    setCurrentWordCount(0);
    setNoteWordCount(0);
  };

  const handleChapterOption = async (option: string, chapterId: string) => {
    const chapterTitle = chapters.find(c => c.id === chapterId)?.title || "Chapter";
    if (option === "Edit Details") {
      setSelectedChapterId(chapterId);
      setEditingTitle(chapters.find(c => c.id === chapterId)?.title ?? "");
      setIsEditTitleOpen(true);
      return;
    }
    if (option === "setPricing") {
      const chapter = chapters.find(c => c.id === chapterId);
      const newIsPaid = !chapter?.isPaid;
      if (!chapterId.startsWith('new_')) {
        await updateChapter(Number(chapterId), { isPaid: newIsPaid, coinCost: newIsPaid ? 10 : 0 });
      }
      setChapters(prev => prev.map(ch => ch.id === chapterId ? { ...ch, isPaid: newIsPaid, coinCost: newIsPaid ? (ch.coinCost || 10) : 0 } : ch));
    } else if (option === 'delete') {
      if (confirm(`Delete "${chapterTitle}"? This cannot be undone.`)) {
        if (!chapterId.startsWith('new_')) {
          await deleteChapterFS(Number(chapterId));
        }
        setChapters(prev => {
          const updated = prev.filter(ch => ch.id !== chapterId);
          if (selectedChapterId === chapterId) setSelectedChapterId(updated[0]?.id || "");
          return updated;
        });
        toast({ title: "Chapter deleted" });
      }
    } else if (option === 'publish') {
      await handlePublishChapter();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-var(--header-height,4rem))] overflow-hidden">
      <Card className="w-full md:w-72 lg:w-80 border-r-0 md:border-r rounded-none md:rounded-lg flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white" onClick={handleNewChapter}>
            <PlusCircle className="mr-2 h-5 w-5" /> New Chapter
          </Button>
        </div>
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Share</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => alert("Share on Facebook (UI Only)")}><Facebook className="h-5 w-5 text-blue-600" /></Button>
            <Button variant="outline" size="icon" onClick={() => alert("Share on X (UI Only)")}><Twitter className="h-5 w-5" /></Button>
            <Button variant="outline" size="icon" onClick={() => alert("Copy Link (UI Only)")}><LinkIcon className="h-5 w-5 text-gray-500" /></Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-muted/80 ${selectedChapterId === chapter.id ? 'bg-muted shadow-sm' : ''}`}
                onClick={() => setSelectedChapterId(chapter.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm truncate ${selectedChapterId === chapter.id ? 'text-primary' : ''}`}>{chapter.title}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {chapter.isPaid ? (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-amber-500 text-white">
                                <DollarSign className="h-3 w-3 mr-1" /> {chapter.coinCost || 0} Coins
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-green-500 text-green-600">
                                Free
                            </Badge>
                        )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => handleChapterOption('Edit Details', chapter.id)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChapterOption('setPricing', chapter.id)}>
                        <DollarSign className="mr-2 h-4 w-4" /> {chapter.isPaid ? "Make Free" : "Set Pricing"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChapterOption('View Stats', chapter.id)}>
                        <FileText className="mr-2 h-4 w-4" /> View Stats
                      </DropdownMenuItem>
                      <DropdownMenuSeparator/>
                      <DropdownMenuItem className="text-destructive hover:!bg-destructive/10 focus:!bg-destructive/10 focus:!text-destructive-foreground" onClick={() => handleChapterOption('delete', chapter.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Chapter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {chapter.words} Words {chapter.date !== "Unpublished" ? `· ${chapter.date.split(' ')[0]}` : `· ${chapter.date}`}
                </p>
              </div>
            ))}
             {chapters.length === 0 && (
              <p className="p-4 text-center text-muted-foreground text-sm">No chapters yet. Click "New Chapter" to start!</p>
            )}
          </div>
        </ScrollArea>
      </Card>

      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden bg-background">
        {selectedChapter ? (
        <Card className="flex-1 flex flex-col shadow-lg rounded-lg overflow-hidden">
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <h2
                  className="text-xl md:text-2xl font-headline text-primary truncate cursor-pointer hover:underline"
                  title="Click to edit title"
                  onClick={openEditTitle}
                >
                  {selectedChapter?.title || "Select or Create a Chapter"}
                </h2>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground shrink-0" onClick={openEditTitle} title="Edit title">
                  <Edit3 className="h-4 w-4" />
                </Button>
                {isAutoSaving && <span className="text-xs text-muted-foreground shrink-0">Saving…</span>}
                {autoSaved && !isAutoSaving && (
                  <span className="flex items-center gap-1 text-xs text-green-600 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
              </div>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={openEditTitle}>
                      <Edit3 className="mr-2 h-4 w-4" />Edit Chapter Title
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePublishChapter}>
                      <Settings2 className="mr-2 h-4 w-4" />Publish Chapter
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <div className="p-3 border-b flex items-center gap-2 bg-muted/20">
              <Button variant="ghost" size="icon" onClick={() => alert("Bold (UI Only)")}><Bold className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => alert("Italic (UI Only)")}><Italic className="h-4 w-4" /></Button>
            </div>

            <ScrollArea className="flex-1 bg-background">
              <Textarea
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                placeholder="Start writing your chapter here..."
                className="w-full h-full min-h-[300px] p-4 md:p-6 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none rounded-none"
              />
            </ScrollArea>
            
            <div className="p-4 border-t bg-muted/20">
              <label htmlFor="optional-note" className="text-sm font-medium text-muted-foreground block mb-1">Note (Optional)</label>
              <Textarea
                id="optional-note"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="You can post anything you want to say to your reader here with no more than 1500 letters. These words will not be counted into this episode."
                rows={3}
                maxLength={1500}
                className="w-full text-sm resize-none focus-visible:ring-1"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{noteWordCount} / 1500 Words</p>
            </div>

            <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3 bg-muted/30">
              <div className="text-sm text-muted-foreground">
                <p>{currentWordCount} Words</p>
                <p>(Ideal word count: 600-1000)</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => toast({ title: "Preview", description: "Preview feature coming soon." })}><Eye className="mr-2 h-4 w-4" />Preview</Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-headline mb-2">No Chapter Selected</h2>
            <p className="text-muted-foreground mb-4">Please select a chapter from the list on the left, or create a new one to start writing.</p>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={handleNewChapter}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Chapter
            </Button>
          </div>
        )}
      </div>
      {/* Edit Chapter Title Dialog */}
      <Dialog open={isEditTitleOpen} onOpenChange={setIsEditTitleOpen}>
        <DialogContent className="sm:max-w-md">
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
              placeholder="Enter chapter title..."
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
  const params = useParams();
  const novelId = params.novelId as string;
  const pageTitle = `Write Chapter for Novel ${novelId || 'Unknown'}`;
  
  return (
    <ClientRoleProtector allowedRoles={["author"]} pageTitle={pageTitle}>
      <WriteChapterContent />
    </ClientRoleProtector>
  );
}
