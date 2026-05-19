
// src/app/messages/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Search, Users, MessageCircle } from "lucide-react"; // Changed icon
import { Input } from "@/components/ui/input";
import React, { useEffect } from "react"; 

// Mock data similar to author-communication, but for general user messages
const mockConversations = [
  { id: "convo1", userName: "BookLover123", avatarUrl: "https://placehold.co/100x100.png?text=BL", dataAiHint: "reader avatar", lastMessage: "Hey, loved your comment on Chapter 5!", lastMessageDate: "1h ago", unread: true },
  { id: "convo2", userName: "StorySeeker", avatarUrl: "https://placehold.co/100x100.png?text=SS", dataAiHint: "user avatar", lastMessage: "Thanks for the recommendation!", lastMessageDate: "5h ago", unread: false },
  { id: "convo3", userName: "PageTurnerPro", avatarUrl: "https://placehold.co/100x100.png?text=PT", dataAiHint: "book lover", lastMessage: "Did you finish 'Whispers of the Void' yet?", lastMessageDate: "2d ago", unread: false },
];

export default function MessagesPage() {
  useEffect(() => {
    document.title = "My Messages | Novelosity";
  }, []);

  // Basic state for a selected conversation and message - UI only
  const [selectedConversation, setSelectedConversation] = React.useState(mockConversations[0]);
  const [message, setMessage] = React.useState("");

  return (
    <div className="h-full flex flex-col">
      <div className="container mx-auto py-8 flex flex-col flex-1">
        <header className="text-center mb-12">
          <Mail className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-headline mb-2">My Messages</h1>
          <p className="text-lg text-muted-foreground">
            Connect with other readers and discuss your favorite stories.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Conversation List Column */}
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="border-b p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-headline">Conversations</CardTitle>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search messages or users..." className="pl-8 h-9" />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y">
                {mockConversations.map(convo => (
                  <div
                    key={convo.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer ${selectedConversation?.id === convo.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedConversation(convo)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={convo.avatarUrl} alt={convo.userName} data-ai-hint={convo.dataAiHint} />
                        <AvatarFallback>{convo.userName.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-sm">{convo.userName}</p>
                          {convo.unread && <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                      </div>
                      <p className="text-xs text-muted-foreground self-start">{convo.lastMessageDate}</p>
                    </div>
                  </div>
                ))}
              </div>
               {mockConversations.length === 0 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">No messages yet.</p>
               )}
            </CardContent>
          </Card>

          {/* Message Area Column */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.avatarUrl} alt={selectedConversation.userName} data-ai-hint={selectedConversation.dataAiHint} />
                        <AvatarFallback>{selectedConversation.userName.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-headline">{selectedConversation.userName}</CardTitle>
                      <CardDescription className="text-xs">Online</CardDescription> {/* Placeholder status */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto bg-muted/20">
                  {/* Placeholder for chat messages */}
                  <div className="flex justify-start">
                    <div className="bg-background border p-3 rounded-lg max-w-[70%]">
                      <p className="text-sm">Hey, loved your comment on Chapter 5!</p>
                      <p className="text-xs text-right text-muted-foreground mt-1">{selectedConversation.userName} - 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[70%]">
                      <p className="text-sm">Oh, thanks! Glad you enjoyed it. That twist was unexpected, right?</p>
                      <p className="text-xs text-right opacity-70 mt-1">You - 10:32 AM</p>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="border-t p-4">
                  <form
                    className="flex items-center gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert(`Message sent to ${selectedConversation.userName}: ${message} (UI Only)`);
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
                  <MessageCircle className="mx-auto h-12 w-12 mb-4" />
                  <p>Select a conversation to view messages or start a new one.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

