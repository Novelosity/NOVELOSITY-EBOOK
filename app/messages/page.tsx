"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Search, Users, MessageCircle, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { getConversations, getMessages, sendMessage, ConversationWithMeta, Message } from "@/actions/messages";
import Link from "next/link";

export default function MessagesPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<ConversationWithMeta | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "My Messages | Novelosity";
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    setLoadingConvos(true);
    getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoadingConvos(false));
  }, [isSignedIn]);

  const loadMessages = useCallback(async (convoId: number) => {
    const msgs = await getMessages(convoId);
    setMessages(msgs);
  }, []);

  // Poll for new messages every 5 seconds when a conversation is selected
  useEffect(() => {
    if (!selectedConvo) return;
    loadMessages(selectedConvo.id);
    pollRef.current = setInterval(() => loadMessages(selectedConvo.id), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConvo, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvo) return;
    setSending(true);
    try {
      const msg = await sendMessage(selectedConvo.id, messageText.trim());
      setMessages((prev) => [...prev, msg]);
      setMessageText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <LogIn className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-headline mb-2">Sign in to view messages</h2>
        <Button asChild><Link href="/login">Sign In / Register</Link></Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="container mx-auto py-8 flex flex-col flex-1">
        <header className="text-center mb-8">
          <Mail className="mx-auto h-12 w-12 text-primary mb-3" />
          <h1 className="text-3xl font-headline mb-1">My Messages</h1>
          <p className="text-muted-foreground">Connect with other readers and authors.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Conversation list */}
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="border-b p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-headline">Conversations</CardTitle>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-8 h-9" />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
              ) : conversations.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No conversations yet. Start one by visiting another user&apos;s profile.</p>
              ) : (
                <div className="divide-y">
                  {conversations.map((convo) => (
                    <div
                      key={convo.id}
                      className={`p-3 hover:bg-muted/50 cursor-pointer ${selectedConvo?.id === convo.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedConvo(convo)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={convo.otherUserPhoto} alt={convo.otherUserName} />
                          <AvatarFallback>{convo.otherUserName[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{convo.otherUserName}</p>
                          <p className="text-xs text-muted-foreground truncate">{convo.lastMessage || 'No messages yet'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message area */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedConvo ? (
              <>
                <CardHeader className="border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConvo.otherUserPhoto} alt={selectedConvo.otherUserName} />
                      <AvatarFallback>{selectedConvo.otherUserName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg font-headline">{selectedConvo.otherUserName}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-3 overflow-y-auto bg-muted/20 max-h-[400px]">
                  {messages.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hello!</p>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-lg max-w-[70%] ${isMe ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>
                <CardContent className="border-t p-4">
                  <form className="flex items-center gap-3" onSubmit={handleSend}>
                    <Textarea
                      placeholder="Type your message..."
                      className="flex-1 resize-none"
                      rows={1}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                    />
                    <Button type="submit" size="icon" disabled={sending || !messageText.trim()}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-1 items-center justify-center">
                <div className="text-center text-muted-foreground py-12">
                  <MessageCircle className="mx-auto h-12 w-12 mb-4" />
                  <p>Select a conversation to start chatting.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
