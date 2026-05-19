
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Loader2, AlertTriangle } from "lucide-react";
import { generateChapterTitle } from "@/ai/flows/generate-chapter-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ClientRoleProtector from "@/components/ClientRoleProtector";

function ChapterTitleGeneratorContent() {
  const [description, setDescription] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please provide a chapter description.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedTitle("");
    try {
      const result = await generateChapterTitle({ chapterDescription: description });
      setGeneratedTitle(result.title);
    } catch (err) {
      setError("Failed to generate title. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <Wand2 className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-headline mb-2">AI Chapter Title Generator</h1>
        <p className="text-lg text-muted-foreground">
          Let AI spark your creativity! Describe your chapter and get an engaging title.
        </p>
      </header>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Generate Your Title</CardTitle>
          <CardDescription>
            Enter a brief description of your chapter content below. The more detail you provide, the better the AI can assist you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chapter-description" className="text-base">Chapter Description</Label>
              <Textarea
                id="chapter-description"
                placeholder="e.g., The protagonist discovers a hidden map leading to an ancient artifact, but is pursued by a shadowy organization..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="text-base"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Title
                </>
              )}
            </Button>
          </form>
        </CardContent>
        
        {(generatedTitle || error) && (
          <CardFooter className="flex flex-col items-start pt-6 border-t">
            {error && (
              <Alert variant="destructive" className="w-full mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {generatedTitle && (
              <div className="w-full">
                <h3 className="text-xl font-headline mb-2 text-primary">Suggested Title:</h3>
                <div className="p-4 bg-primary/10 rounded-md">
                  <p className="text-2xl font-semibold text-primary-foreground bg-primary p-3 rounded">{generatedTitle}</p>
                </div>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function ChapterTitleGeneratorPage() {
  return (
    <ClientRoleProtector allowedRoles={["author"]} pageTitle="AI Chapter Title Generator">
      <ChapterTitleGeneratorContent />
    </ClientRoleProtector>
  );
}
