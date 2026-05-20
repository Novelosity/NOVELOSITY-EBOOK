"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, BookOpen, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { getReadingHistory } from "@/actions/social";

interface HistoryItem {
  id: number;
  novelId: number;
  chapterId: number;
  novelTitle: string;
  chapterTitle: string;
  coverImageUrl: string | null;
  readAt: Date | null;
}

export default function ReadingHistoryPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Reading History | Novelosity";
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }
    getReadingHistory(50)
      .then((rows) => setHistory(rows as HistoryItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isSignedIn, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <LogIn className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline mb-2">Sign in to view your history</h2>
          <Button asChild><Link href="/login">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl px-4">
      <div className="flex items-center gap-3 mb-8">
        <History className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-headline">Reading History</h1>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">No reading history yet.</p>
          <p className="text-sm text-muted-foreground mb-6">Start reading a novel to track your progress here.</p>
          <Button asChild><Link href="/browse">Browse Novels</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex gap-4 items-center">
                <div className="relative w-12 h-16 shrink-0 rounded overflow-hidden">
                  <Image
                    src={item.coverImageUrl || "https://placehold.co/60x80.png"}
                    alt={item.novelTitle}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/novel/${item.novelId}`} className="font-semibold text-sm hover:underline line-clamp-1">
                    {item.novelTitle}
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.chapterTitle}</p>
                  {item.readAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.readAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/reader/${item.novelId}/${item.chapterId}`}>
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Continue
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
