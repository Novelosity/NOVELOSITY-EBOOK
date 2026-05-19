// src/app/authors/[authorId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, BookOpen, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Author } from "@/types/novelosity";

// Mock author data (in a real app, this would be fetched)
const mockAuthorsData: Record<string, Author & { books: {id: string, title: string, coverImageUrl: string, dataAiHint: string}[] }> = {
  "1": {
    id: "1",
    name: "Elara Vance",
    bio: "Elara Vance is a bestselling author of epic fantasy novels, known for her intricate world-building and compelling characters. She lives in a quiet cottage surrounded by ancient woods.",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "female author portrait",
    books: [
      { id: "1", title: "Whispers of the Void", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "fantasy book" },
      { id: "7", title: "Echoes of the Past", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "historical fiction" },
    ]
  },
  "2": {
    id: "2",
    name: "Jax Ryder",
    bio: "Jax Ryder writes gritty cyberpunk thrillers that explore the intersection of technology and humanity. His works often feature dystopian societies and rogue AI.",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "male author portrait",
    books: [
      { id: "2", title: "Neon City Chronicles", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "cyberpunk novel" },
    ]
  },
   "3": {
    id: "3",
    name: "Mira Quasar",
    bio: "Mira Quasar is an astrophysicist turned sci-fi author, specializing in hard science fiction and breathtaking space operas. Her stories are grounded in scientific accuracy.",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "scientist portrait",
    books: [
        { id: "3", title: "The Last Stargazer", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "science fiction" },
    ]
  },
  "4": {
    id: "4",
    name: "Fiona Greenleaf",
    bio: "Fiona Greenleaf pens enchanting fantasy romances set in magical realms. Her stories are filled with lyrical prose and heartwarming relationships.",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "author fantasy",
    books: [
        { id: "4", title: "Gardens of Eldoria", coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "romance novel" },
    ]
  }
};


export default function AuthorProfilePage() {
  const params = useParams();
  const authorId = params.authorId as string;
  const [author, setAuthor] = useState<(Author & { books: any[] }) | null>(null);

  useEffect(() => {
    if (authorId && mockAuthorsData[authorId]) {
      setAuthor(mockAuthorsData[authorId]);
      document.title = `${mockAuthorsData[authorId].name} | Author Profile | Novelosity`;
    } else {
      document.title = "Author Not Found | Novelosity";
    }
  }, [authorId]);

  if (!author) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-muted-foreground">Author not found or loading...</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/authors"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Authors</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/authors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Authors
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-xl mb-12">
        <CardHeader className="p-6 sm:p-8 bg-muted/30">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-primary shadow-lg">
              <AvatarImage src={author.avatarUrl} alt={author.name} data-ai-hint={author.dataAiHint} />
              <AvatarFallback className="text-5xl">{author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl sm:text-4xl font-headline mb-2">{author.name}</CardTitle>
              <Button variant="default" className="mt-2" onClick={() => alert(`Following ${author.name} (UI Placeholder)`)}>
                <UserPlus className="mr-2 h-4 w-4" /> Follow Author
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-2xl font-headline mb-3">About {author.name}</h2>
          <CardDescription className="text-base leading-relaxed whitespace-pre-line">
            {author.bio || "No biography available."}
          </CardDescription>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-3xl font-headline mb-8 text-center sm:text-left">Books by {author.name}</h2>
        {author.books && author.books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {author.books.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/reader/${book.id}/chapter-1`} className="block">
                  <div className="aspect-[2/3] relative w-full">
                    <Image 
                      src={book.coverImageUrl} 
                      alt={book.title} 
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover"
                      data-ai-hint={book.dataAiHint}
                    />
                  </div>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold truncate" title={book.title}>{book.title}</CardTitle>
                  </CardContent>
                </Link>
                <CardFooter className="p-4 pt-0">
                   <Button variant="outline" size="sm" className="w-full" asChild>
                     <Link href={`/reader/${book.id}/chapter-1`}>
                        <BookOpen className="mr-2 h-4 w-4" /> Read Now
                     </Link>
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No books found for this author yet.</p>
        )}
      </section>
    </div>
  );
}
