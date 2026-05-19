
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Download, MessageSquare, Send, Settings, UserCircle, ALargeSmall, Sun, Moon, BookText, Maximize, Minimize, Library, Bookmark, Star, Share2, Lock, Coins, Flag, Columns } from "lucide-react"; // Added Columns icon
import { useParams, useRouter } from "next/navigation"; // Added useRouter
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chapter as ChapterType, Book as BookType, UserComment as Comment } from "@/types/novelosity"; // Adjusted import


const mockBook: BookType = {
  id: "sample-book",
  title: "Chronicles of Aethel",
  author: { id: "author-1", name: "Elara Vance"}, // Simplified author for mock
  genre: ["Fantasy"],
  tags: ["magic", "adventure"],
  chapters: [
    {
      id: "chapter-1",
      chapterNumber: 1,
      title: "The Shadow's Call",
      content: `
        <p class="mb-4">The old willow wept by the riverbank, its branches trailing in the murky water. Elara, no older than sixteen summers, traced patterns in the damp earth with a stick, her thoughts as tangled as the roots of the ancient tree. A peculiar chill had settled over the village of Oakhaven, a cold that seeped into bones and whispered of forgotten things. It wasn't the bite of winter, for the harvest moon still hung fat and orange in the twilight sky. This was something else, something unnatural.</p>
        <p class="mb-4">"It started with the dreams," she murmured, her voice barely audible above the river's sigh. Dreams of crumbling towers and eyes that glowed in the dark. Dreams that left her waking with a scream caught in her throat and a sheen of cold sweat on her brow.</p>
        <p class="mb-4">Old Man Hemlock, the village elder and a purveyor of grim prophecies, had spoken of a rising shadow, a blight upon the land that would consume all light. Most dismissed his words as the ramblings of a senile mind, but Elara felt a disquieting truth in them. The livestock grew restless, the crops withered despite the clement weather, and even the boisterous laughter of children seemed muted, hesitant.</p>
        <p class="mb-4">A twig snapped nearby. Elara sprang to her feet, her makeshift staff held ready. A figure emerged from the deepening gloom, tall and cloaked. "Easy, child," a gruff voice said. It was Kael, the reclusive ranger who lived on the outskirts of the Whispering Woods. His face, weathered and scarred, was usually set in a stern mask, but tonight, Elara saw a flicker of concern in his eyes.</p>
        <p class="mb-4">"The woods are stirring," Kael said, his gaze sweeping their surroundings. "Things that should sleep are walking. The shadow Hemlock spoke of... it's closer than we think."</p>
        <p class="mb-4">Elara's heart hammered against her ribs. She had always felt a connection to the woods, a sense of belonging that the manicured fields of Oakhaven could never offer. But now, even the familiar rustle of leaves sounded ominous.</p>
        <p class="mb-4">"What can we do?" she asked, her voice trembling slightly.</p>
        <p class="mb-4">Kael looked at her, a long, assessing gaze. "You'vefelt it too, haven't you? The wrongness." Elara nodded. "There's an old shrine deep in the woods, a place of power. It might hold some answers, or at least, a way to fight back. But it's dangerous. I won't lie to you."</p>
        <p class="mb-4">The choice lay before her, stark and clear. The relative safety of Oakhaven, slowly succumbing to the encroaching darkness, or the perilous path into the heart of the Whispering Woods, towards an uncertain fate. The weeping willow seemed to hold its breath, the river stilled its murmur. In that moment, Elara knew her path. The call of the unknown, the whisper of adventure, was too strong to ignore. The shadow had called, and she, in her own way, would answer.</p>
      `,
      isLocked: false,
    },
    {
      id: "chapter-2",
      chapterNumber: 2,
      title: "Whispers in the Woods",
      content: "<p>The journey into the Whispering Woods began at dawn...</p><p>Elara followed Kael, her senses heightened. Every rustle of leaves, every snap of a twig, seemed to carry a hidden meaning. The woods were indeed different; an oppressive silence hung in the air, broken only by the occasional, mournful cry of an unseen bird. Sunlight struggled to penetrate the dense canopy, casting long, dancing shadows that played tricks on the eyes.</p><p>\"Stay close,\" Kael grunted, his hand never far from the hilt of his longsword. \"The paths are treacherous, and not all who wander these woods are friendly.\"</p><p>Hours passed. They navigated through tangled thickets, crossed gurgling streams on moss-slicked stones, and climbed over fallen giants of trees that had stood for centuries. Elara, though tired, felt a strange exhilaration. This was a world far removed from the mundane routines of Oakhaven. Here, every step was a discovery, every shadow held a potential secret.</p><p>They stopped to rest by a clear pool, its surface reflecting the slivers of sky visible through the leaves. Kael produced some dried meat and hard bread from his pack. As they ate, Elara asked, \"What kind of things are walking, Kael? What did you mean?\"</p><p>Kael chewed thoughtfully before answering. \"Creatures of shadow, child. Twisted things that feed on fear and despair. They are servants of the blight, drawn to its power. Some are ancient, things that should have faded into legend long ago.\"</p><p>A shiver ran down Elara's spine. \"And the shrine? What is it?\"</p><p>\"A relic from the Old Times,\" Kael explained. \"A place where the barriers between worlds are thin. It was once a source of great light, but now... I fear it may have been corrupted, or its guardians weakened.\"</p><p>Suddenly, a low growl echoed through the trees. Kael was on his feet in an instant, sword drawn. Elara scrambled up, her staff ready. From the undergrowth, three pairs of glowing red eyes stared at them. Shadow Hounds, their forms indistinct and wavering, emerged, their fangs bared in silent snarls.</p><p>\"Stand back, Elara!\" Kael commanded, positioning himself between her and the creatures. The hounds lunged. The fight was a blur of motion and snarling. Kael moved with a deadly grace Elara had never witnessed, his sword a silver flash in the dim light. One hound fell, dissolving into a wisp of black smoke. Another lunged at Elara, but she reacted instinctively, swinging her staff and connecting with its flank. It yelped, a sound like tearing fabric, and stumbled back.</p><p>Kael dispatched the remaining two. He stood panting, his face grim. \"They are bold, to attack so close to the shrine's path. The darkness is indeed growing stronger.\"</p><p>Elara, though shaken, felt a surge of adrenaline. She had faced a real threat and had not faltered. Perhaps Old Man Hemlock wasn't so mad after all. And perhaps, just perhaps, she had a role to play in the events unfolding.</p><p>\"Let's keep moving,\" Kael said, sheathing his sword. \"The shrine is not much further.\"</p><p>As they pressed on, the woods grew darker, the air heavier. The whispers started then, faint at first, like the rustling of dry leaves, but gradually growing clearer, insidious voices that seemed to crawl under her skin, murmuring doubts and fears. Elara clenched her jaw, focusing on Kael's steady presence ahead, and on the faint, almost forgotten warmth of the sunstone pendant her mother had given her, tucked beneath her tunic. The woods were testing her, and she would not break.</p>",
      isLocked: true,
      coinCost: 10,
    },
  ],
};

const mockComments: Comment[] = [
  { id: "1", user: { name: "ReaderFan22", initials: "RF", avatarUrl: "https://placehold.co/40x40.png?text=RF" }, text: "Wow, what an opening! I'm hooked.", timestamp: "2 hours ago" },
  { id: "2", user: { name: "LoremIpsum", initials: "LI" }, text: "Great descriptions, really sets the mood.", timestamp: "1 hour ago" },
  { id: "3", user: { name: "BookwormBetty", initials: "BB", avatarUrl: "https://placehold.co/40x40.png?text=BB" }, text: "Kael seems like an interesting character. Can't wait to see what happens next!", timestamp: "30 mins ago" },
];


export default function ReaderPage() {
  const params = useParams();
  const { bookId, chapterId } = params;
  const router = useRouter();

  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("font-body"); 
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pageFlipMode, setPageFlipMode] = useState(false); 
  
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [showSettings, setShowSettings] = useState(false);
  const [isChapterUnlocked, setIsChapterUnlocked] = useState(false); 

  const chapter = useMemo(() => {
    const book = mockBook; 
    const currentChapter = book.chapters.find(ch => ch.id === chapterId);
    if (currentChapter && !currentChapter.isLocked) {
      setIsChapterUnlocked(true); 
    } else if (currentChapter && currentChapter.isLocked) {
      // For this demo, retain unlock state if previously unlocked
      // In a real app, this would be persisted user data
      setIsChapterUnlocked(isChapterUnlocked); 
    } else {
        setIsChapterUnlocked(false);
    }
    return currentChapter;
  }, [bookId, chapterId, isChapterUnlocked]);


  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (chapter && mockBook) {
      document.title = `${mockBook.title} - Chapter ${chapter.chapterNumber}: ${chapter.title} by ${mockBook.author.name} | Novelosity`;
    } else if (mockBook) {
      document.title = `${mockBook.title} by ${mockBook.author.name} | Novelosity`;
    } else {
      document.title = "Reader | Novelosity";
    }
  }, [chapter, mockBook]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newCommentObj: Comment = {
      id: String(Date.now()),
      user: { name: "Current User", initials: "CU", avatarUrl: "https://placehold.co/40x40.png?text=CU", dataAiHint: "user avatar" }, 
      text: newComment,
      timestamp: "Just now",
    };
    setComments(prev => [newCommentObj, ...prev]);
    setNewComment("");
  };

  const handleUnlockChapter = () => {
    alert(`Unlocking chapter with ${chapter?.coinCost} coins (UI Demo)`);
    setIsChapterUnlocked(true);
  };

  const navigateChapter = (targetChapterId: string | undefined) => {
    if (targetChapterId) {
      router.push(`/reader/${bookId}/${targetChapterId}`);
    }
  };


  if (!chapter) {
    return <div className="container mx-auto py-8 text-center">Chapter not found.</div>;
  }
  
  const currentChapterIndex = mockBook.chapters.findIndex(ch => ch.id === chapterId);
  const prevChapter = currentChapterIndex > 0 ? mockBook.chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < mockBook.chapters.length - 1 ? mockBook.chapters[currentChapterIndex + 1] : null;


  return (
    <div className={`reader-page ${fontFamily} transition-all duration-300 flex flex-col h-full`}>
      <div className="container mx-auto py-4 md:py-8 flex flex-col flex-1">
        <Card className="mb-4 md:mb-8 shadow-md sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
              <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)} aria-label="Settings">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleFullScreen} aria-label={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
               <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle Theme">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="icon" onClick={() => alert(`Added '${mockBook.title}' to library! (UI Only)`)} aria-label="Add to Library">
                <Library className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => alert(`Bookmarked Chapter ${chapter.chapterNumber}! (UI Only)`)} aria-label="Bookmark Chapter">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => alert(`Rate '${mockBook.title}' (UI Only)`)} aria-label="Rate Book">
                <Star className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => alert("Share functionality (UI only).")} aria-label="Share Book">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => alert(`Reporting '${mockBook.title}' (UI Only)`)} aria-label="Report Book">
                <Flag className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => alert("Download chapter functionality (UI only).")} aria-label="Download Chapter">
                <Download className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
               {prevChapter && (
                <Button variant="outline" onClick={() => navigateChapter(prevChapter?.id)}>Prev</Button>
              )}
              <span className="text-sm text-muted-foreground whitespace-nowrap">Chapter {chapter.chapterNumber}</span>
              {nextChapter && (
                <Button variant="default" onClick={() => navigateChapter(nextChapter?.id)}>Next</Button>
              )}
            </div>
          </CardContent>
          {showSettings && (
            <CardFooter className="p-3 md:p-4 border-t flex flex-col md:flex-row gap-4 md:items-end flex-wrap">
              <div className="flex-1 min-w-[150px] space-y-2">
                <Label htmlFor="font-size" className="text-xs">Font Size: {fontSize}px</Label>
                <Slider
                  id="font-size"
                  min={12} max={32} step={1}
                  defaultValue={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>
              <div className="flex-1 min-w-[150px] space-y-2">
                <Label htmlFor="font-family" className="text-xs">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger id="font-family">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="font-body">PT Sans (Body)</SelectItem>
                    <SelectItem value="font-headline">Playfair Display (Headline)</SelectItem>
                    <SelectItem value="font-sans">System Sans-Serif</SelectItem>
                    <SelectItem value="font-serif">System Serif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-4 md:pt-0 md:self-end">
                <Switch 
                  id="page-flip-mode" 
                  checked={pageFlipMode} 
                  onCheckedChange={setPageFlipMode}
                />
                <Label htmlFor="page-flip-mode" className="text-xs flex items-center gap-1">
                  <Columns className="h-3 w-3"/> Page Flip Mode
                </Label>
              </div>
            </CardFooter>
          )}
        </Card>

        <Card className="shadow-lg flex flex-col flex-1 overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-headline">{chapter.title}</CardTitle>
            <CardDescription className="text-sm">From "{mockBook.title}" - Chapter {chapter.chapterNumber}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="py-6 md:py-8 flex flex-col flex-1 overflow-hidden">
            {chapter.isLocked && !isChapterUnlocked ? (
              <div className="text-center py-10 flex flex-col items-center justify-center flex-1">
                <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-headline mb-2">This Chapter is Locked</h3>
                <p className="text-muted-foreground mb-4">
                  Unlock this chapter to continue reading.
                </p>
                <Button onClick={handleUnlockChapter} size="lg">
                  <Coins className="mr-2 h-5 w-5" /> Unlock with {chapter.coinCost} Coins
                </Button>
              </div>
            ) : (
              <ScrollArea className={`flex-1 pr-4 ${pageFlipMode ? 'overflow-hidden' : ''}`}>
                {pageFlipMode ? (
                  <div className="text-center p-10 text-muted-foreground">
                    <Columns className="h-12 w-12 mx-auto mb-4" />
                    Page flip mode is active. (UI Placeholder: Content would be paginated here)
                    <div 
                        style={{fontSize: `${fontSize}px`}} 
                        className="mt-4 prose dark:prose-invert prose-lg max-w-none mx-auto leading-relaxed" 
                        dangerouslySetInnerHTML={{ __html: chapter.content.substring(0,300) + "..." }} 
                    />

                  </div>
                ) : (
                  <article 
                    style={{fontSize: `${fontSize}px`}}
                    className="prose dark:prose-invert prose-lg max-w-none mx-auto leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                  />
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <section className="mt-8 md:mt-12">
          <h2 className="text-2xl md:text-3xl font-headline mb-6 flex items-center">
            <MessageSquare className="h-7 w-7 mr-3 text-primary" /> Reader Comments
          </h2>
          <Card className="shadow-md">
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
                <Avatar className="hidden sm:block">
                  <AvatarImage src="https://placehold.co/40x40.png?text=CU" data-ai-hint="person avatar" />
                  <AvatarFallback>CU</AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="Share your thoughts on this chapter..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="flex-grow"
                />
                <Button type="submit" size="icon" aria-label="Post comment">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
              <Separator className="mb-6" />
              <div className="space-y-6">
                {comments.length > 0 ? comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={comment.user.avatarUrl} data-ai-hint={comment.user.dataAiHint || "person avatar"} />
                      <AvatarFallback>{comment.user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{comment.user.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => alert(`Report comment ID ${comment.id}? (UI Only)`)}
                            aria-label="Report comment"
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
