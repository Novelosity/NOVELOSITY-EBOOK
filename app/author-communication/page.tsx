
// src/app/author-communication/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useEffect } from "react"; 
import ClientRoleProtector from "@/components/ClientRoleProtector";

const mockAuthors = [
  { id: "author1", name: "Elara Vance", avatarUrl: "https://placehold.co/100x100.png", dataAiHint: "female author", lastMessage: "Re: Chapter 5 Edits", lastMessageDate: "2h ago", unread: true },
  { id: "author2", name: "Jax Ryder", avatarUrl: "https://placehold.co/100x100.png", dataAiHint: "male author", lastMessage: "Thanks for the feedback!", lastMessageDate: "1d ago", unread: false },
  { id: "author3", name: "Mira Quasar", avatarUrl: "https://placehold.co/100x100.png", dataAiHint: "scientist author", lastMessage: "Question about publishing schedule", lastMessageDate: "3d ago", unread: true },
];

function AuthorCommunicationContent() {
  const [selectedAuthor, setSelectedAuthor] = React.useState(mockAuthors[0]);
  const [message, setMessage] = React.useState("");

  return (
    <div className="h-full flex flex-col">
      <div className="container mx-auto py-8 flex flex-col flex-1">
        <header className="text-center mb-12">
          <MessageSquare className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-headline mb-2">Author Communication Center</h1>
          <p className="text-lg text-muted-foreground">
            Connect with authors regarding their submissions and editorial feedback.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 flex-1 overflow-hidden">
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="border-b p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-headline">Authors</CardTitle>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search authors..." className="pl-8 h-9" />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y">
                {mockAuthors.map(author => (
                  <div
                    key={author.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer ${selectedAuthor?.id === author.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedAuthor(author)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={author.avatarUrl} alt={author.name} data-ai-hint={author.dataAiHint} />
                        <AvatarFallback>{author.name.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-sm">{author.name}</p>
                          {author.unread && <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{author.lastMessage}</p>
                      </div>
                      <p className="text-xs text-muted-foreground self-start">{author.lastMessageDate}</p>
                    </div>
                  </div>
                ))}
              </div>
               {mockAuthors.length === 0 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">No authors to display.</p>
               )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 flex flex-col">
            {selectedAuthor ? (
              <>
                <CardHeader className="border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedAuthor.avatarUrl} alt={selectedAuthor.name} data-ai-hint={selectedAuthor.dataAiHint} />
                        <AvatarFallback>{selectedAuthor.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-headline">{selectedAuthor.name}</CardTitle>
                      <CardDescription className="text-xs">Online</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto bg-muted/20">
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[70%]">
                      <p className="text-sm">Hi {selectedAuthor.name}, just checking in on the revisions for Chapter 3. Let me know if you have any questions!</p>
                      <p className="text-xs text-right opacity-70 mt-1">You - 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-background border p-3 rounded-lg max-w-[70%]">
                      <p className="text-sm">Hey! Making good progress. Should have them to you by end of day.</p>
                      <p className="text-xs text-right text-muted-foreground mt-1">{selectedAuthor.name} - 10:32 AM</p>
                    </div>
                  </div>
                   <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[70%]">
                      <p className="text-sm">Sounds great, thanks for the update!</p>
                      <p className="text-xs text-right opacity-70 mt-1">You - 10:33 AM</p>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="border-t p-4">
                  <form
                    className="flex items-center gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert(`Message sent to ${selectedAuthor.name}: ${message} (UI Only)`);
                      setMessage("");
                    }}
                  >
                    <Textarea
                      placeholder="Type your message..."
                      className="flex-1 resize-none"
                      rows={1}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-1 items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                  <p>Select an author to start a conversation.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthorCommunicationPage() {
  return (
    <ClientRoleProtector allowedRoles={["editor"]} pageTitle="Author Communication">
      <AuthorCommunicationContent />
    </ClientRoleProtector>
  );
}
