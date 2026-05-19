
// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { History, Library, Download, Wallet, BarChartBig, Award, Edit3, ShieldAlert, Coins, FileText, Ticket, DollarSign, PenTool, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext"; // Import useRole

const profileSections = [
  { title: "Reading History", description: "Track the books and chapters you've explored.", icon: History, href: "/profile/history", actionLabel: "View History" },
  { title: "My Library & Favorites", description: "Manage your saved books and favorite reads.", icon: Library, href: "/profile/library", actionLabel: "View Library" },
  { title: "Downloads", description: "Access your downloaded content for offline reading.", icon: Download, href: "/profile/downloads", actionLabel: "View Downloads" },
  { title: "Reading Statistics", description: "Discover insights into your reading habits.", icon: BarChartBig, href: "/profile/statistics", actionLabel: "View Stats" },
  { title: "Badges & Achievements", description: "Showcase your reading milestones.", icon: Award, href: "/profile/badges", actionLabel: "View Badges" },
  { title: "Transaction History", description: "Review your coin purchases and chapter unlocks.", icon: FileText, href: "/profile/transactions", actionLabel: "View Transactions"},
];

const mockUser = {
  name: "Alex Reader", // This could come from RoleContext or a future auth context
  email: "alex.reader@example.com",
  avatarUrl: "https://placehold.co/128x128.png",
  dataAiHint: "person reading book",
  initials: "AR",
  joinDate: "Joined March 2023",
  initialCoinBalance: 250,
};

const coinPackages = [
  { id: "pkg1", coins: 100, price: "$0.99", description: "Starter Pack" },
  { id: "pkg2", coins: 550, price: "$4.99", description: "Value Pack (Save 10%)" },
  { id: "pkg3", coins: 1200, price: "$9.99", description: "Reader's Delight (Save 20%)" },
];

export default function ProfilePage() {
  const { currentRole, setCurrentRole, isLoading: isRoleLoading } = useRole(); // Use RoleContext
  const { toast } = useToast();
  const [coinBalance, setCoinBalance] = useState(mockUser.initialCoinBalance);
  const [isBuyCoinsModalOpen, setIsBuyCoinsModalOpen] = useState(false);
  const [selectedCoinPackageId, setSelectedCoinPackageId] = useState<string | null>(coinPackages[0].id);

  useEffect(() => {
    document.title = "Your Profile | Novelosity";
  }, []);

  const handleBecomeAuthor = () => {
    setCurrentRole("author");
    toast({
      title: "Welcome, Author!",
      description: "You now have access to author tools. Check your navigation menu.",
    });
  };

  const handleBuyCoins = () => {
    if (!selectedCoinPackageId) {
      toast({
        title: "No Package Selected",
        description: "Please select a coin package to purchase.",
        variant: "destructive",
      });
      return;
    }
    const selectedPackage = coinPackages.find(pkg => pkg.id === selectedCoinPackageId);
    if (selectedPackage) {
      const newBalance = coinBalance + selectedPackage.coins;
      setCoinBalance(newBalance);
      toast({
        title: "Purchase Successful!",
        description: `You've added ${selectedPackage.coins} coins. Your new balance is ${newBalance}.`,
      });
      setIsBuyCoinsModalOpen(false);
    }
  };

  if (isRoleLoading) {
    return <div className="container mx-auto py-8 px-4 md:px-6">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-10">
        <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary shadow-md">
              <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} data-ai-hint={mockUser.dataAiHint} />
              <AvatarFallback className="text-4xl">{mockUser.initials}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-headline text-primary mb-1">{mockUser.name}</h1>
              <p className="text-muted-foreground mb-1">{mockUser.email}</p>
              <p className="text-sm text-muted-foreground">{mockUser.joinDate} (Role: <span className="font-semibold capitalize">{currentRole}</span>)</p>
            </div>
            <div className="md:ml-auto flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-headline">Wallet & Subscriptions</CardTitle>
              <Wallet className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <div className="flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-accent" />
                  <p className="text-2xl font-semibold">{coinBalance} Coins</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="default" className="w-full" onClick={() => setIsBuyCoinsModalOpen(true)}>
                  <Coins className="mr-2 h-4 w-4" /> Buy More Coins
                </Button>
                <div className="flex items-center justify-center pt-2">
                  <Image src="https://placehold.co/100x30.png?text=Google+Pay" alt="Google Pay available" width={100} height={30} data-ai-hint="google pay logo" className="opacity-75" />
                </div>
                <Button variant="outline" className="w-full" onClick={() => alert('Navigate to Manage Subscriptions page (UI Only)')}>
                  <Ticket className="mr-2 h-4 w-4" /> Manage Subscriptions
                </Button>
              </div>
            </CardContent>
          </Card>

        {currentRole === 'author' ? (
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-headline">Author Tools & Earnings</CardTitle>
              <DollarSign className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">Accumulated Income</p>
                <p className="text-3xl font-bold">$1,234.56</p> 
              </div>
              <div className="flex space-x-2 mb-3">
                <Button variant="outline" size="sm" onClick={() => alert("Navigate to Payment Info (UI Only)")}>Payment Info</Button>
                <Button variant="outline" size="sm" onClick={() => alert("Navigate to Detailed Report (UI Only)")}>View Details</Button>
              </div>
              <Button variant="default" className="w-full" asChild>
                <Link href="/author-dashboard">
                   <Edit className="mr-2 h-4 w-4" /> Go to Author Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          currentRole === 'reader' && ( // Only show "Become an Author" if current role is reader
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-headline">Share Your Story</CardTitle>
                <PenTool className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to publish your work and reach readers? Become an author on Novelosity.
                </p>
                <Button className="w-full" onClick={handleBecomeAuthor}>
                  Become an Author
                </Button>
              </CardContent>
            </Card>
          )
        )}

        {profileSections.map((section) => (
          <Card key={section.title} className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-headline">{section.title}</CardTitle>
              <section.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
              <Button variant="outline" className="w-full" onClick={() => alert(`Navigate to ${section.title} (UI Only)`)}>
                {section.actionLabel}
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
                 <Link href="/settings#content-preferences">
                    Manage Settings
                 </Link>
               </Button>
            </CardContent>
          </Card>
      </div>

      <Dialog open={isBuyCoinsModalOpen} onOpenChange={setIsBuyCoinsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Buy Coins</DialogTitle>
            <DialogDescription>
              Select a coin package to add to your wallet. Payments are securely processed.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup 
            value={selectedCoinPackageId ?? ""} 
            onValueChange={setSelectedCoinPackageId}
            className="space-y-3 py-4"
          >
            {coinPackages.map((pkg) => (
              <Label 
                key={pkg.id} 
                htmlFor={pkg.id}
                className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
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
          <DialogFooter className="sm:justify-between items-center">
            <Image src="https://placehold.co/120x40.png?text=Google+Pay" alt="Google Pay" width={120} height={40} data-ai-hint="google pay button" className="opacity-80" />
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleBuyCoins}>
                Confirm Purchase
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
