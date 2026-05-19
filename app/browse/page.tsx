
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchIcon, X, Library, Star, ListFilter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getPublishedNovels, Novel as FirestoreNovel } from "@/lib/firestore";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string[];
  tags: string[];
  coverImageUrl: string;
  dataAiHint: string;
  completionStatus?: "Completed" | "Ongoing"; 
}

const allBooks: Book[] = [
  { id: "1", title: "Whispers of the Void", author: "Elara Vance", genre: ["Fantasy", "Mystery"], tags: ["magic", "adventure", "dark"], coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "fantasy book", completionStatus: "Completed" },
  { id: "2", title: "Neon City Chronicles", author: "Jax Ryder", genre: ["Sci-Fi", "Cyberpunk"], tags: ["dystopian", "tech", "future"], coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "cyberpunk novel", completionStatus: "Ongoing" },
  { id: "3", title: "The Last Stargazer", author: "Mira Quasar", genre: ["Sci-Fi", "Space Opera"], tags: ["space", "exploration", "aliens"], coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "science fiction", completionStatus: "Completed" },
  { id: "4", title: "Gardens of Eldoria", author: "Fiona Greenleaf", genre: ["Fantasy", "Romance"], tags: ["elves", "nature", "love"], coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "romance novel", completionStatus: "Ongoing" },
  { id: "5", title: "Quantum Entanglement", author: "Dr. Aris Thorne", genre: ["Sci-Fi", "Hard Sci-Fi"], tags: ["physics", "time travel", "mind-bending"], coverImageUrl: "https://placehold.co/300x450.png", dataAiHint: "sci-fi book", completionStatus: "Completed" },
];

const allGenres = ["Fantasy", "Sci-Fi", "Mystery", "Cyberpunk", "Space Opera", "Romance", "Hard Sci-Fi"];
const allTags = ["magic", "adventure", "dark", "dystopian", "tech", "future", "space", "exploration", "aliens", "elves", "nature", "love", "physics", "time travel", "mind-bending"];
const completionStatuses = ["All", "Completed", "Ongoing"];

export default function BrowsePage() {
  useEffect(() => {
    document.title = "Browse Books | Novelosity";
  }, []);

  const [allBooksData, setAllBooksData] = useState<Book[]>(allBooks);

  // Load real novels from Firestore, fall back to mock data if empty
  useEffect(() => {
    getPublishedNovels(50)
      .then((novels: FirestoreNovel[]) => {
        if (novels.length > 0) {
          const mapped: Book[] = novels.map((n) => ({
            id: n.id ?? '',
            title: n.title,
            author: n.authorName,
            genre: [n.genre],
            tags: n.tags,
            coverImageUrl: n.coverImageUrl || 'https://placehold.co/300x450.png',
            dataAiHint: n.genre,
            completionStatus: (n.status === 'published' ? 'Ongoing' : 'Ongoing') as "Ongoing" | "Completed",
          }));
          setAllBooksData(mapped);
        }
      })
      .catch(console.error);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(allBooks);

  useEffect(() => {
    let books = allBooksData;
    if (searchTerm) {
      books = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedGenre && selectedGenre !== "all") {
      books = books.filter(book => book.genre.includes(selectedGenre));
    }
    if (selectedTags.length > 0) {
      books = books.filter(book => selectedTags.every(tag => book.tags.includes(tag)));
    }
    if (selectedStatus && selectedStatus !== "All") {
      books = books.filter(book => book.completionStatus === selectedStatus);
    }
    setFilteredBooks(books);
  }, [searchTerm, selectedGenre, selectedTags, selectedStatus, allBooksData]);

  const handleTagChange = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGenre(undefined);
    setSelectedTags([]);
    setSelectedStatus(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-headline mb-8 text-center">Browse Books</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Section */}
        <aside className="md:col-span-1 space-y-6 p-6 bg-card rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline">Filters</h2>
            <Button onClick={resetFilters} variant="ghost" size="sm" className="text-xs">
              <X className="mr-1 h-3 w-3" /> Reset
            </Button>
          </div>
          
          <div>
            <Label htmlFor="search" className="text-sm font-medium">Search by Title/Author</Label>
            <div className="relative mt-1">
              <Input 
                id="search" 
                type="text" 
                placeholder="e.g., Neon City, Jax Ryder" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="genre" className="text-sm font-medium">Genre</Label>
            <Select value={selectedGenre} onValueChange={(value) => setSelectedGenre(value === "all" ? undefined : value)}>
              <SelectTrigger id="genre" className="mt-1">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {allGenres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="completion-status" className="text-sm font-medium">Completion Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value === "All" ? undefined : value)}>
              <SelectTrigger id="completion-status" className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {completionStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Tags</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {allTags.map(tag => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`tag-${tag}`} 
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagChange(tag)}
                  />
                  <Label htmlFor={`tag-${tag}`} className="text-sm font-normal capitalize cursor-pointer">{tag}</Label>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Books Grid Section */}
        <main className="md:col-span-3">
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredBooks.length} of {allBooks.length} books
          </div>
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <Link href={`/reader/${book.id}/chapter-1`} className="block group">
                    <div className="aspect-[2/3] relative w-full">
                      <Image 
                        src={book.coverImageUrl} 
                        alt={book.title} 
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={book.dataAiHint}
                      />
                       {book.completionStatus && (
                        <Badge 
                          variant={book.completionStatus === "Completed" ? "default" : "secondary"} 
                          className="absolute top-2 right-2"
                        >
                          {book.completionStatus}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg font-headline truncate group-hover:text-primary transition-colors" title={book.title}>{book.title}</CardTitle>
                      <CardDescription className="text-sm">by {book.author}</CardDescription>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{book.genre.join(', ')}</span>
                      </div>
                    </CardContent>
                  </Link>
                  <CardFooter className="p-4 pt-0 border-t mt-auto">
                    <div className="flex justify-between w-full gap-2 mt-2">
                       <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1" 
                        onClick={() => alert(`'${book.title}' added to library! (UI Only)`)}
                      >
                        <Library className="mr-2 h-4 w-4" /> Library
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => alert(`Rate '${book.title}' (UI Only)`)}
                      >
                        <Star className="mr-2 h-4 w-4" /> Rate
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ListFilter className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No books match your current filters.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

