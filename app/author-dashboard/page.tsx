
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  BookCopy,
  TrendingUp,
  Users,
  Edit3,
  PlusCircle,
  PenTool,
  CalendarDays,
  Library,
  Eye,
  BookText,
  AlertCircle,
  Lightbulb,
  GraduationCap,
  Sparkles,
  MoreVertical,
  CreditCard,
  FileSignature, 
  BarChart2, Settings2, Trash2
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientRoleProtector from "@/components/ClientRoleProtector";
import { useAuth } from "@/contexts/AuthContext";
import { getNovelsByAuthor, updateNovel, deleteNovel, Novel } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface AuthorStory {
  id: string;
  title: string;
  coverImageUrl: string;
  dataAiHint: string;
  subscribers: number;
  views: number;
  words: number;
  status: "Ongoing" | "Completed";
  lastUpdate: string;
  contractStatus: "None" | "PendingReview" | "Signed";
}

const initialMockAuthorStories: AuthorStory[] = [
  {
    id: "story1",
    title: "Chronicles of Aethel",
    coverImageUrl: "https://placehold.co/300x450.png",
    dataAiHint: "fantasy epic",
    subscribers: 1205,
    views: 25600,
    words: 85000,
    status: "Ongoing",
    lastUpdate: "2 days ago",
    contractStatus: "None",
  },
  {
    id: "story2",
    title: "Neon Ghosts of Neo-Kyoto",
    coverImageUrl: "https://placehold.co/300x450.png",
    dataAiHint: "cyberpunk thriller",
    subscribers: 850,
    views: 18200,
    words: 62000,
    status: "Completed",
    lastUpdate: "1 month ago",
    contractStatus: "Signed",
  },
  {
    id: "story3",
    title: "Whispers of the Ancient Tree",
    coverImageUrl: "https://placehold.co/300x450.png",
    dataAiHint: "mystery forest",
    subscribers: 500,
    views: 10000,
    words: 4500, 
    status: "Ongoing",
    lastUpdate: "5 days ago",
    contractStatus: "None",
  },
];

function AuthorDashboardContent() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [authorStories, setAuthorStories] = useState<AuthorStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingStories(true);
    getNovelsByAuthor(user.uid)
      .then((novels: Novel[]) => {
        const mapped: AuthorStory[] = novels.map((n) => ({
          id: n.id ?? '',
          title: n.title,
          coverImageUrl: n.coverImageUrl || 'https://placehold.co/300x450.png',
          dataAiHint: n.genre,
          subscribers: n.subscribers,
          views: n.views,
          words: n.wordCount,
          status: n.status === 'published' ? 'Ongoing' : 'Ongoing',
          lastUpdate: n.updatedAt ? new Date((n.updatedAt as { seconds: number })?.seconds * 1000).toLocaleDateString() : 'Recently',
          contractStatus: 'None',
        }));
        setAuthorStories(mapped);
      })
      .catch(console.error)
      .finally(() => setLoadingStories(false));
  }, [user]);

  const handleApplyForContract = async (storyId: string) => {
    setAuthorStories(prev =>
      prev.map(s => s.id === storyId ? { ...s, contractStatus: "PendingReview" as const } : s)
    );
    try {
      await updateNovel(storyId, { status: 'submitted' });
      const story = authorStories.find(s => s.id === storyId);
      toast({ title: "Contract application submitted", description: `"${story?.title}" has been submitted for review.` });
    } catch {
      toast({ title: "Error", description: "Failed to submit contract application.", variant: "destructive" });
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm("Are you sure you want to delete this novel? This cannot be undone.")) return;
    try {
      await deleteNovel(storyId);
      setAuthorStories(prev => prev.filter(s => s.id !== storyId));
      toast({ title: "Novel deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete novel.", variant: "destructive" });
    }
  };

  const getContractButton = (story: AuthorStory) => {
    if (story.status !== "Ongoing") return null;

    switch (story.contractStatus) {
      case "None":
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-700" 
            onClick={() => handleApplyForContract(story.id)}
            disabled={story.words < 5000} 
          >
            <FileSignature className="mr-2 h-4 w-4" /> Apply for Contract
            {story.words < 5000 && <span className="text-xs ml-1">(Need {5000-story.words} more words)</span>}
          </Button>
        );
      case "PendingReview":
        return (
          <Button size="sm" variant="outline" disabled>
            <FileSignature className="mr-2 h-4 w-4" /> Application Pending
          </Button>
        );
      case "Signed":
        return (
          <Button size="sm" variant="default" disabled className="bg-blue-600 hover:bg-blue-700">
            <FileSignature className="mr-2 h-4 w-4" /> Contract Signed
          </Button>
        );
      default:
        return null;
    }
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline text-primary">Author Dashboard</h1>
        <p className="text-muted-foreground">Manage your stories, track earnings, and engage with your readers.</p>
      </header>

      {/* Top Row Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accumulated Income</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$1,234.56</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button size="sm" variant="outline" onClick={() => alert("Navigate to Payment Info (UI Only)")} className="flex-1">Payment Info</Button>
            <Button size="sm" onClick={() => alert("View Detailed Earnings (UI Only)")} className="flex-1">Details</Button>
            <Button size="sm" variant="default" onClick={() => alert("Request Payout (UI Only)")} className="flex-1 w-full sm:w-auto mt-2 sm:mt-0 bg-green-600 hover:bg-green-700 text-white">
              <CreditCard className="mr-2 h-4 w-4" /> Request Payout
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Books Overview</CardTitle>
            <BookCopy className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authorStories.length} Books</div>
            <ul className="text-xs text-muted-foreground list-disc list-inside pl-1 mt-1">
              <li>{authorStories.filter(s => s.status === "Ongoing").length} Ongoing</li>
              <li>{authorStories.filter(s => s.status === "Completed").length} Completed</li>
            </ul>
          </CardContent>
           <CardFooter>
            <Button size="sm" variant="outline" className="w-full" onClick={() => alert("Manage Books (UI Only)")}>Manage All Books</Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Quick Look</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authorStories.reduce((sum, s) => sum + s.views, 0).toLocaleString()}+ Views</div>
            <p className="text-xs text-muted-foreground">Across all published stories</p>
             <div className="mt-1 text-lg font-semibold">{authorStories.reduce((sum, s) => sum + s.subscribers, 0).toLocaleString()}+ Followers</div>
            <p className="text-xs text-muted-foreground">Total author followers</p>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline" className="w-full" onClick={() => alert("View Detailed Analytics (UI Only)")}>View Full Analytics</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-headline flex items-center"><Library className="mr-2 h-6 w-6 text-primary" /> My Stories</CardTitle>
                <Button variant="default" size="sm" asChild>
                  <Link href="/author/create-novel">
                    <PlusCircle className="mr-2 h-4 w-4" /> New Story
                  </Link>
                </Button>
              </div>
               <CardDescription>Manage your existing stories or start a new masterpiece.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md mb-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-primary">Authoring Tip:</p>
                  <p className="text-sm text-foreground/80">Engage your readers by updating frequently! Aim for at least 5,000 words for new story submissions to meet platform guidelines for contract eligibility.</p>
                </div>
              </div>

              <div className="space-y-6">
                {authorStories.map(story => (
                  <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/4 relative aspect-[2/3] sm:aspect-auto">
                        <Image 
                          src={story.coverImageUrl} 
                          alt={story.title} 
                          fill 
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 25vw"
                          data-ai-hint={story.dataAiHint}
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-headline mb-1">{story.title}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                                <MoreVertical className="h-4 w-4"/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => alert(`Viewing analytics for ${story.title} (UI Only)`)}>
                                <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert(`Opening publish settings for ${story.title} (UI Only)`)}>
                                <Settings2 className="mr-2 h-4 w-4" /> Publish Settings
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive hover:!bg-destructive/10"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete "${story.title}"? This action cannot be undone.`)) {
                                    setAuthorStories(prev => prev.filter(s => s.id !== story.id));
                                    alert(`Story "${story.title}" deleted (UI Only).`);
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Story
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                          <span><Users className="inline h-3 w-3 mr-1" />{story.subscribers.toLocaleString()} Subscribers</span>
                          <span><Eye className="inline h-3 w-3 mr-1" />{story.views.toLocaleString()} Views</span>
                          <span><BookText className="inline h-3 w-3 mr-1" />{story.words.toLocaleString()} Words</span>
                          <Badge variant={story.status === "Ongoing" ? "secondary" : "default"} className="text-xs">{story.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Last Update: {story.lastUpdate}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => router.push(`/author/write/${story.id}`)}>
                            <PenTool className="mr-2 h-4 w-4" /> New Chapter
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default" 
                            onClick={() => {
                              alert(`Navigating to edit story details for "${story.title}". In a real app, this form would be pre-filled. Editing might be restricted if a contract is signed and requires editor approval.`);
                              router.push(`/author/create-novel?storyId=${story.id}`);
                            }}
                          >
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Story Details
                          </Button>
                          {getContractButton(story)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                 {authorStories.length === 0 && <p className="text-center text-muted-foreground py-4">No stories created yet. Start your first one!</p>}
              </div>
            </CardContent>
            <CardFooter>
                <Button variant="link" className="mx-auto" onClick={() => alert("View All Stories (UI Only)")}>View All Stories &rarr;</Button>
            </CardFooter>
          </Card>
        </section>

        <aside className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Content Calendar</CardTitle>
              <CardDescription>Track your writing progress and schedule updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select defaultValue="story1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select story..." />
                  </SelectTrigger>
                  <SelectContent>
                    {authorStories.map(story => (
                      <SelectItem key={story.id} value={story.id}>{story.title}</SelectItem>
                    ))}
                    <SelectItem value="all">All Stories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border bg-background p-0.5">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="w-full p-0"
                  classNames={{
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                />
              </div>
              {selectedDate && (
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  <span className="font-semibold text-primary">1,250 words</span> updated in {selectedDate?.toLocaleString('default', { month: 'long' })}.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-primary" /> Author Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tools/chapter-title-generator"><Sparkles className="mr-2 h-4 w-4" /> AI Chapter Title Generator</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => alert("Plot Helper Tool (UI Only)")}><PenTool className="mr-2 h-4 w-4" /> Plot Helper (Coming Soon)</Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary" /> Upcoming Events & Contests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No upcoming events scheduled. Check back soon!</p>
          </CardContent>
           <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => alert("View all events (UI Only)")}>View All Events</Button>
          </CardFooter>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><GraduationCap className="mr-2 h-5 w-5 text-primary" /> Writers Academy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Browse resources, tips, and tutorials to hone your craft.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => alert("Go to Writers Academy (UI Only)")}>Explore Academy</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function AuthorDashboardPage() {
  return (
    <ClientRoleProtector allowedRoles={["author"]} pageTitle="Author Dashboard">
      <AuthorDashboardContent />
    </ClientRoleProtector>
  );
}
