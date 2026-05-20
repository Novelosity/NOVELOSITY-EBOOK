"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchIcon, X, Library, Star, ListFilter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Novel } from "@/actions/novels";

interface Props {
  novels: Novel[];
  genres: string[];
  tags: string[];
}

export function BrowseClient({ novels, genres, tags }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return novels.filter((n) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!n.title.toLowerCase().includes(q) && !n.authorName.toLowerCase().includes(q)) return false;
      }
      if (selectedGenre && n.genre !== selectedGenre) return false;
      if (selectedTags.length > 0) {
        const novelTags = (n.tags ?? "").split(",").map((t) => t.trim());
        if (!selectedTags.every((t) => novelTags.includes(t))) return false;
      }
      return true;
    });
  }, [novels, searchTerm, selectedGenre, selectedTags]);

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const reset = () => {
    setSearchTerm("");
    setSelectedGenre("");
    setSelectedTags([]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Filters */}
      <aside className="md:col-span-1 space-y-6 p-6 bg-card rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headline">Filters</h2>
          <Button onClick={reset} variant="ghost" size="sm" className="text-xs">
            <X className="mr-1 h-3 w-3" /> Reset
          </Button>
        </div>

        <div>
          <Label htmlFor="search" className="text-sm font-medium">Search</Label>
          <div className="relative mt-1">
            <Input
              id="search"
              placeholder="Title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {genres.length > 0 && (
          <div>
            <Label htmlFor="genre" className="text-sm font-medium">Genre</Label>
            <Select value={selectedGenre} onValueChange={(v) => setSelectedGenre(v === "all" ? "" : v)}>
              <SelectTrigger id="genre" className="mt-1">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Tags</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {tags.map((tag) => (
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
        )}
      </aside>

      {/* Grid */}
      <main className="md:col-span-3">
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filtered.length} of {novels.length} novels
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((novel) => (
              <Card key={novel.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <Link href={`/reader/${novel.id}/chapter-1`} className="block group">
                  <div className="aspect-[2/3] relative w-full">
                    <Image
                      src={novel.coverImageUrl || "https://placehold.co/300x450.png"}
                      alt={novel.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      {novel.status === "published" ? "Ongoing" : novel.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-headline truncate group-hover:text-primary transition-colors" title={novel.title}>
                      {novel.title}
                    </CardTitle>
                    <CardDescription className="text-sm">by {novel.authorName}</CardDescription>
                    {novel.genre && (
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {novel.genre}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Link>
                <CardFooter className="p-4 pt-0 border-t mt-auto">
                  <div className="flex justify-between w-full gap-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Library className="mr-2 h-4 w-4" /> Library
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" disabled>
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
            <p className="text-xl text-muted-foreground">No novels match your filters.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
