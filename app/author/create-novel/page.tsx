
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Info, UploadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClientRoleProtector from "@/components/ClientRoleProtector";
import { useUser } from "@clerk/nextjs";
import { createNovel } from "@/actions/novels";
import { put } from "@vercel/blob";
import { useToast } from "@/hooks/use-toast";

const novelFormSchema = z.object({
  bookTitle: z.string().min(1, "Book title is required").max(100, "Title should be within 100 characters"),
  language: z.string().min(1, "Language is required"),
  targetAudience: z.enum(["female", "male", "all"]),
  contentRating: z.enum(["4+", "12+", "16+", "18+"]),
  novelType: z.string().min(1, "Novel type is required"),
  genre: z.string().min(1, "Genre is required"),
  tags: z.string().optional(),
  synopsis: z.string().min(20, "Synopsis must be at least 20 words").max(300, "Synopsis should be between 20 to 300 words"),
  bookCover: z.any().optional(), 
});

type NovelFormData = z.infer<typeof novelFormSchema>;

const tagCategories = {
  "Main Character Roles/Identities": ["Lycan", "Mafia", "Medical Genius", "Nanny", "Omega", "Playboy", "Police", "Professor", "Rebel", "Rogue", "Secretary", "Slave", "Star", "Teenager", "Vampire", "Warrior", "Witch / Wizard"],
  "Story Elements/Tropes": ["Triplets", "Twins"],
  "Character Traits": ["Possessive", "Protective", "Optimism", "Victim", "Paranoid", "Decisive", "Brave", "Ruthless"],
};


function CreateNovelContent() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<NovelFormData>({
    resolver: zodResolver(novelFormSchema),
    defaultValues: {
      bookTitle: "",
      language: "English",
      targetAudience: "all",
      contentRating: "12+",
      novelType: "Original",
      genre: "", 
      tags: "",
      synopsis: "",
    },
  });

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [modalSelectedTags, setModalSelectedTags] = useState<string[]>([]);
  const currentTagsFieldValue = watch("tags");

  useEffect(() => {
    if (isTagModalOpen) {
      const tagsArray = currentTagsFieldValue?.split(',').map(tag => tag.trim()).filter(tag => tag) || [];
      setModalSelectedTags(tagsArray);
    }
  }, [isTagModalOpen, currentTagsFieldValue]);

  const handleTagToggle = (tag: string) => {
    setModalSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveTags = () => {
    setValue("tags", modalSelectedTags.join(", "));
    setIsTagModalOpen(false);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const onSubmit = async (data: NovelFormData) => {
    if (!user) {
      toast({ title: "Not signed in", description: "Please sign in to create a novel.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      let coverImageUrl = 'https://placehold.co/600x800.png';
      if (coverFile) {
        const blob = await put(`covers/${user.id}/${Date.now()}_${coverFile.name}`, coverFile, { access: 'public' });
        coverImageUrl = blob.url;
      }
      const novel = await createNovel({
        title: data.bookTitle,
        synopsis: data.synopsis,
        genre: data.genre,
        tags: data.tags ?? '',
        coverImageUrl,
        contentRating: data.contentRating,
      });
      toast({ title: "Novel created!", description: "Now add your first chapter." });
      router.push(`/author/write/${novel.id}`);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to create novel. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-5xl mx-auto shadow-xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-3xl font-headline">Novel Information</CardTitle>
          <Button variant="ghost" asChild>
            <Link href="/author-dashboard" className="text-sm text-primary hover:underline">
              SKIP <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid md:grid-cols-3 gap-8 p-6">
            <div className="md:col-span-1 space-y-4">
              <div
                className="aspect-[3/4] w-full bg-muted rounded-md flex flex-col items-center justify-center border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <Image src={coverPreview} alt="Cover preview" width={300} height={400} className="object-cover w-full h-full" />
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2 text-center px-4">Click to upload cover image</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverChange}
              />
              <p className="text-xs text-muted-foreground text-center">
                Cover size: 600x800; File format: .jpg, .png, .webp
              </p>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <Label htmlFor="bookTitle" className="flex items-center">Book Title <Info className="ml-1 h-3 w-3 text-muted-foreground" /></Label>
                <Controller
                  name="bookTitle"
                  control={control}
                  render={({ field }) => <Input id="bookTitle" placeholder="Enter book title" {...field} />}
                />
                {errors.bookTitle && <p className="text-sm text-destructive mt-1">{errors.bookTitle.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">Book titles should be within 100 characters.</p>
              </div>

              <div>
                <Label htmlFor="language" className="flex items-center">Language <Info className="ml-1 h-3 w-3 text-muted-foreground" /></Label>
                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="language"><SelectValue placeholder="Select language" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.language && <p className="text-sm text-destructive mt-1">{errors.language.message}</p>}
              </div>
              
              <div>
                <Label className="flex items-center">Target Audience <Info className="ml-1 h-3 w-3 text-muted-foreground" /></Label>
                <Controller
                  name="targetAudience"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 mt-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                       <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">All</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                 {errors.targetAudience && <p className="text-sm text-destructive mt-1">{errors.targetAudience.message}</p>}
              </div>

              <div>
                <Label className="flex items-center">Content Rating <Info className="ml-1 h-3 w-3 text-muted-foreground" /></Label>
                <Controller
                  name="contentRating"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 mt-1 flex-wrap">
                      {["4+", "12+", "16+", "18+"].map(rating => (
                        <div key={rating} className="flex items-center space-x-2">
                          <RadioGroupItem value={rating} id={`rating-${rating}`} />
                          <Label htmlFor={`rating-${rating}`}>{rating}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.contentRating && <p className="text-sm text-destructive mt-1">{errors.contentRating.message}</p>}
              </div>

              <div>
                <Label htmlFor="novelType" className="flex items-center">Novel Type <Info className="ml-1 h-3 w-3 text-muted-foreground" /></Label>
                 <Controller
                  name="novelType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="novelType"><SelectValue placeholder="Select novel type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Original">Original</SelectItem>
                        <SelectItem value="FanFiction">Fan-Fiction</SelectItem>
                        <SelectItem value="Translation">Translation</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.novelType && <p className="text-sm text-destructive mt-1">{errors.novelType.message}</p>}
              </div>

              <div>
                <Label htmlFor="genre" className="flex items-center">Genre <Info className="ml-1 h-3 w-3 text-muted-foreground" /></Label>
                 <Controller
                  name="genre"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="genre"><SelectValue placeholder="Please select a genre" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fantasy">Fantasy</SelectItem>
                        <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                        <SelectItem value="Romance">Romance</SelectItem>
                        <SelectItem value="Mystery">Mystery</SelectItem>
                        <SelectItem value="Thriller">Thriller</SelectItem>
                        <SelectItem value="Historical">Historical</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.genre && <p className="text-sm text-destructive mt-1">{errors.genre.message}</p>}
              </div>

              <div>
                <Label htmlFor="tags" className="flex items-center">Tags <Info className="ml-1 h-3 w-3 text-muted-foreground" /></Label>
                <div className="flex items-center gap-2">
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => <Input id="tags" placeholder="e.g., magic, adventure, dystopian (comma-separated)" {...field} className="flex-grow" />}
                />
                  <Button type="button" variant="outline" onClick={() => setIsTagModalOpen(true)}>Edit Tags</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Goodnovel will promote your book(s) to future readers who share the same interests with you based on your choice of tags.
                </p>
              </div>
              
              <div>
                <Label htmlFor="synopsis" className="flex items-center">Synopsis <Info className="ml-1 h-3 w-3 text-muted-foreground" /></Label>
                <Controller
                  name="synopsis"
                  control={control}
                  render={({ field }) => <Textarea id="synopsis" placeholder="Please write a description for your story with 20 to 300 words." rows={5} {...field} />}
                />
                {errors.synopsis && <p className="text-sm text-destructive mt-1">{errors.synopsis.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Please take consideration of this because this item is crucial in attracting readers.
                  Tip: Inserting the genre and tags you chose above in the description and describing them in natural language can increase the relevance of your novel to your readers' search queries. Does the synopsis comply with our Content Policies?{' '}
                  <button
                    type="button"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      alert("Content Policies details (UI Placeholder)"); 
                    }} 
                    className="text-primary hover:underline"
                  >
                    Learn more
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 border-t">
            <Button type="submit" size="lg" className="w-full md:w-auto md:ml-auto" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Novel"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Select Tags</DialogTitle>
            <DialogDescription>
              Choose tags that best describe your novel. You can select multiple tags.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {Object.entries(tagCategories).map(([category, tags]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 text-primary">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge
                        key={tag}
                        variant={modalSelectedTags.includes(tag) ? "default" : "outline"}
                        onClick={() => handleTagToggle(tag)}
                        className="cursor-pointer text-sm px-3 py-1.5 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTags}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CreateNovelPage() {
  return (
    <ClientRoleProtector allowedRoles={["author"]} pageTitle="Create New Novel">
      <CreateNovelContent />
    </ClientRoleProtector>
  );
}
