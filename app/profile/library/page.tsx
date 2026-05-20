"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library, BookOpen, LogIn, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { getLibrary, removeFromLibrary } from "@/actions/social";

interface LibraryItem {
  id: number;
  novelId: number;
  novelTitle: string;
  coverImageUrl: string | null;
  authorName: string | null;
  addedAt: Date | null;
}

export default function LibraryPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { toast } = useToast();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    document.title = "My Library | Novelosity";
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }
    getLibrary()
      .then((rows) => setItems(rows as LibraryItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isSignedIn, isLoaded]);

  const handleRemove = async (novelId: number) => {
    setRemoving(novelId);
    try {
      await removeFromLibrary(novelId);
      setItems((prev) => prev.filter((i) => i.novelId !== novelId));
      toast({ title: "Removed from library" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    } finally {
      setRemoving(null);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <LogIn className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline mb-2">Sign in to view your library</h2>
          <Button asChild><Link href="/login">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <div className="flex items-center gap-3 mb-8">
        <Library className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-headline">My Library</h1>
        <span className="text-muted-foreground">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Library className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Your library is empty.</p>
          <p className="text-sm text-muted-foreground mb-6">Browse novels and add them to your library.</p>
          <Button asChild><Link href="/browse">Browse Novels</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative flex flex-col">
              <Link href={`/novel/${item.novelId}`}>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <Image
                    src={item.coverImageUrl || "https://placehold.co/200x300.png"}
                    alt={item.novelTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
              </Link>
              <div className="mt-2 flex-1">
                <Link href={`/novel/${item.novelId}`} className="text-sm font-semibold line-clamp-2 hover:underline">
                  {item.novelTitle}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{item.authorName}</p>
              </div>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="default" className="flex-1 text-xs h-7" asChild>
                  <Link href={`/reader/${item.novelId}/chapter-1`}>
                    <BookOpen className="mr-1 h-3 w-3" /> Read
                  </Link>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(item.novelId)}
                  disabled={removing === item.novelId}
                  aria-label="Remove from library"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
