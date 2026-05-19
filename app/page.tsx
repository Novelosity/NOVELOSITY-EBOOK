
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Zap, TrendingUp, Sparkles, UserCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  useEffect(() => {
    document.title = "Novelosify - Read and Write Amazing Novels";
  }, []);

  const trendingBooks = [
    { id: "1", title: "Whispers of the Void", author: "Elara Vance", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "fantasy book" },
    { id: "2", title: "Neon City Chronicles", author: "Jax Ryder", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "cyberpunk novel" },
    { id: "3", title: "The Last Stargazer", author: "Mira Quasar", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "science fiction" },
  ];

  const newReleases = [
    { id: "4", title: "Gardens of Eldoria", author: "Fiona Greenleaf", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "romance novel" },
    { id: "5", title: "Quantum Entanglement", author: "Dr. Aris Thorne", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "sci-fi book" },
    { id: "6", title: "The Alchemist's Secret", author: "Orion Blackwood", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "mystery novel" },
  ];

  const recommendedBooks = [
    { id: "7", title: "Echoes of the Past", author: "Seraphina Moon", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "historical fiction" },
    { id: "1", title: "Whispers of the Void", author: "Elara Vance", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "fantasy book" }, // Re-using for variety
    { id: "2", title: "Neon City Chronicles", author: "Jax Ryder", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "cyberpunk novel" }, // Re-using for variety
  ];

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-headline mb-6">Welcome to Novelosity!</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Dive into your next adventure or craft your own masterpiece. Explore, read, and create with Novelosity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-headline">Explore Reads</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Browse our vast library of novels across all genres.</CardDescription>
              <Button asChild className="mt-4 w-full" variant="default">
                <Link href="/browse">Start Reading</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-headline">Discover Authors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Find your new favorite authors and follow their work.</CardDescription>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/authors">Meet Authors</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-headline">Author Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Generate captivating chapter titles with our AI tool.</CardDescription>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/tools/chapter-title-generator">Use AI Generator</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-7 w-7 text-primary" />
          <h3 className="text-2xl font-headline">Trending Now</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <Link href={`/reader/${book.id}/chapter-1`} className="block">
                <div className="aspect-[2/3] relative w-full">
                  <Image 
                    src={book.coverImageUrl} 
                    alt={book.title} 
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={book.dataAiHint}
                  />
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-headline truncate" title={book.title}>{book.title}</CardTitle>
                  <CardDescription className="text-sm">by {book.author}</CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-7 w-7 text-primary" />
          <h3 className="text-2xl font-headline">New Releases</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newReleases.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <Link href={`/reader/${book.id}/chapter-1`} className="block">
                <div className="aspect-[2/3] relative w-full">
                  <Image 
                    src={book.coverImageUrl} 
                    alt={book.title} 
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={book.dataAiHint}
                  />
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-headline truncate" title={book.title}>{book.title}</CardTitle>
                  <CardDescription className="text-sm">by {book.author}</CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="h-7 w-7 text-primary" />
          <h3 className="text-2xl font-headline">Recommended For You</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <Link href={`/reader/${book.id}/chapter-1`} className="block">
                <div className="aspect-[2/3] relative w-full">
                  <Image 
                    src={book.coverImageUrl} 
                    alt={book.title} 
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={book.dataAiHint}
                  />
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-headline truncate" title={book.title}>{book.title}</CardTitle>
                  <CardDescription className="text-sm">by {book.author}</CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

