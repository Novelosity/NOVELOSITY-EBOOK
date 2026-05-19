
"use client";

import { useEffect } from "react";
// src/app/authors/page.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Author } from "@/types/novelosity";
import { UserPlus } from "lucide-react";
import Image from "next/image"; // Using next/image for author specific images if available
import Link from "next/link";

const mockAuthors: Author[] = [
  {
    id: "1",
    name: "Elara Vance",
    bio: "Elara Vance is a bestselling author of epic fantasy novels, known for her intricate world-building and compelling characters. She lives in a quiet cottage surrounded by ancient woods.",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "female author portrait",
  },
  {
    id: "2",
    name: "Jax Ryder",
    bio: "Jax Ryder writes gritty cyberpunk thrillers that explore the intersection of technology and humanity. His works often feature dystopian societies and rogue AI.",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "male author portrait",
  },
  {
    id: "3",
    name: "Mira Quasar",
    bio: "Mira Quasar is an astrophysicist turned sci-fi author, specializing in hard science fiction and breathtaking space operas. Her stories are grounded in scientific accuracy.",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "scientist portrait",
  },
  {
    id: "4",
    name: "Fiona Greenleaf",
    bio: "Fiona Greenleaf pens enchanting fantasy romances set in magical realms. Her stories are filled with lyrical prose and heartwarming relationships.",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "author fantasy"
  }
];

export default function AuthorsPage() {
  useEffect(() => {
    document.title = "Meet Our Authors | Novelosity";
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-headline mb-10 text-center">Meet Our Authors</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockAuthors.map((author) => (
          <Card key={author.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center text-center p-6 bg-muted/30">
              <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-md">
                <AvatarImage src={author.avatarUrl} alt={author.name} data-ai-hint={author.dataAiHint} />
                <AvatarFallback className="text-3xl">{author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-headline">{author.name}</CardTitle>
              {/* Could add a subtitle like "Bestselling Fantasy Author" */}
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <CardDescription className="text-base line-clamp-4 leading-relaxed">
                {author.bio || "No biography available."}
              </CardDescription>
            </CardContent>
            <CardFooter className="p-6 border-t">
              <div className="flex justify-between w-full gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/authors/${author.id}`}>View Profile</Link>
                </Button>
                <Button variant="default" className="flex-1" onClick={() => alert(`Following ${author.name} (UI Placeholder)`)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Follow
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Reader Recommendations Section - could be a separate component */}
      <section className="mt-16 pt-8 border-t">
        <h2 className="text-3xl font-headline mb-8 text-center">Recommended For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Example recommendation cards - can be books or authors */}
          {mockAuthors.slice(0,4).reverse().map(recAuthor => (
            <Card key={`rec-${recAuthor.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/authors/${recAuthor.id}`} className="block">
                <div className="aspect-square relative w-full">
                  <Image src={recAuthor.avatarUrl || "https://placehold.co/300x300.png"} alt={recAuthor.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" data-ai-hint={recAuthor.dataAiHint || "author portrait"} />
                </div>
                <CardContent className="p-3">
                  <CardTitle className="text-md font-headline truncate">{recAuthor.name}</CardTitle>
                  <CardDescription className="text-xs">Popular Author</CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
