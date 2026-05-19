"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { History, Library, Download, Wallet, BarChartBig, Award, Edit3, ShieldAlert, Coins, FileText, Ticket, DollarSign, PenTool, Edit, LogIn } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@clerk/nextjs";

const coinPackages = [
  { id: "pkg1", coins: 100, price: "$0.99", description: "Starter Pack" },
  { id: "pkg2", coins: 550, price: "$4.99", description: "Value Pack (Save 10%)" },
  { id: "pkg3", coins: 1200, price: "$9.99", description: "Reader's Delight (Save 20%)" },
];

const profileSections = [
  { title: "Reading History", description: "Track the books and chapters you've explored.", icon: History, href: "/profile/history", actionLabel: "View History" },
  { title: "My Library & Favorites", description: "Manage your saved books and favorite reads.", icon: Library, href: "/profile/library", actionLabel: "View Library" },
  { title: "Downloads", description: "Access your downloaded content for offline reading.", icon: Download, href: "/profile/downloads", actionLabel: "View Downloads" },
  { title: "Reading Statistics", description: "Discover insights into your reading habits.", icon: BarChartBig, href: "/profile/statistics", actionLabel: "View Stats" },
  { title: "Badges & Achievements", description: "Showcase your reading milestones.", icon: Award, href: "/profile/badges", actionLabel: "View Badges" },
  { title: "Transaction History", description: "Review your coin purchases and chapter unlocks.", icon: FileText, href: "/profile/transactions", actionLabel: "View Transactions" },
];

export default function ProfilePage() {
  const { currentRole, setCurrentRole } = useRole();
  const { userProfile, addCoins, isLoading } = useAuth();
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [isBuyCoinsOpen, setIsBuyCoinsOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(coinPackages[0].id);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    document.title = "Your Profile | Novelosity";
  }, []);

  const handleBecomeAuthor = async () => {
    await setCurrentRole("author");
    toast({ title: "Welcome, Author!", description: "You now have access to author tools." });
  };

  const handleBuyCoins = async () => {
    const pkg = coinPackages.find((p) => p.id === selectedPackageId);
    if (!pkg) return;
    setPurchasing(true);
    try {
      await addCoins(pkg.coins);
      toast({ title: "Purchase Successful!", description: `Added ${pkg.coins} coins to your wallet.` });
      setIsBuyCoinsOpen(false);
    } catch {
      toast({ title: "Error", description: "Purchase failed. Please try again.", variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <LogIn className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-headline mb-2">Sign in to view your profile</h2>
        <p className="text-muted-foreground mb-6">Create an account or sign in to access your library, wallet, and reading history.</p>
        <Button asChild><Link href="/login">Sign In / Register</Link></Button>
      </div>
    );
  }

  const initials = (user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '') || 'U';
  const joinDate = user?.createdAt ? `Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Recently joined';

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-10">
        <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary shadow-md">
              <AvatarImage src={user?.imageUrl ?? ''} alt={user?.fullName ?? 'User'} />
              <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-headline text-primary mb-1">{user?.fullName ?? userProfile?.displayName ?? 'User'}</h1>
              <p className="text-muted-foreground mb-1">{user?.primaryEmailAddress?.emailAddress}</p>
              <p className="text-sm text-muted-foreground">{joinDate} · Role: <span className="font-semibold capitalize">{currentRole}</span></p>
            </div>
            <div className="md:ml-auto">
              <Button variant="outline" asChild>
                <Link href="/settings"><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Wallet */}
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-headline">Wallet</CardTitle>
            <Wallet className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <div className="flex items-center">
                <Coins className="h-5 w-5 mr-2 text-amber-500" />
                <p className="text-2xl font-semibold">{userProfile?.coins ?? 0} Coins</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button variant="default" className="w-full" onClick={() => setIsBuyCoinsOpen(true)}>
                <Coins className="mr-2 h-4 w-4" /> Buy More Coins
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile/transactions"><Ticket className="mr-2 h-4 w-4" /> Manage Subscriptions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Author tools or Become Author */}
        {currentRole === 'author' || currentRole === 'editor' || currentRole === 'admin' ? (
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-headline">Author Tools</CardTitle>
              <DollarSign className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage your stories and track your earnings.</p>
              <Button variant="default" className="w-full" asChild>
                <Link href="/author-dashboard"><Edit className="mr-2 h-4 w-4" /> Author Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-headline">Share Your Story</CardTitle>
              <PenTool className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Ready to publish your work and reach readers?</p>
              <Button className="w-full" onClick={handleBecomeAuthor}>Become an Author</Button>
            </CardContent>
          </Card>
        )}

        {profileSections.map((section) => (
          <Card key={section.title} className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-headline">{section.title}</CardTitle>
              <section.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
              <Button variant="outline" className="w-full" asChild>
                <Link href={section.href}>{section.actionLabel}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-headline">Parental Controls</CardTitle>
            <ShieldAlert className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Manage content filters and age restrictions.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/settings#content-preferences">Manage Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isBuyCoinsOpen} onOpenChange={setIsBuyCoinsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Buy Coins</DialogTitle>
            <DialogDescription>Select a coin package to add to your wallet.</DialogDescription>
          </DialogHeader>
          <RadioGroup value={selectedPackageId} onValueChange={setSelectedPackageId} className="space-y-3 py-4">
            {coinPackages.map((pkg) => (
              <Label key={pkg.id} htmlFor={pkg.id} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={pkg.id} id={pkg.id} />
                  <div>
                    <span className="font-semibold">{pkg.coins} Coins</span>
                    <span className="block text-sm text-muted-foreground">{pkg.description}</span>
                  </div>
                </div>
                <span className="font-semibold text-lg">{pkg.price}</span>
              </Label>
            ))}
          </RadioGroup>
          <DialogFooter className="flex gap-2 justify-end">
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="button" onClick={handleBuyCoins} disabled={purchasing}>
              {purchasing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
