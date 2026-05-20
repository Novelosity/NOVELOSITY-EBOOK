
// src/app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, Bell, ShieldCheck, Palette, EyeOff, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/actions/users";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useUser();
  const { userProfile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [enableNsfwFilter, setEnableNsfwFilter] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [bio, setBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    document.title = "Settings | Novelosity";
  }, []);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      const dark = savedTheme === "dark";
      setIsDarkTheme(dark);
      document.documentElement.classList.toggle("dark", dark);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkTheme(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
    const savedNsfwFilter = localStorage.getItem("nsfwFilter");
    if (savedNsfwFilter) {
      setEnableNsfwFilter(savedNsfwFilter === "true");
    }
  }, []);

  // Pre-fill form with real user data once loaded
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName ?? "");
      setAuthorName(userProfile.authorName ?? "");
      setBio(userProfile.bio ?? "");
    }
  }, [userProfile]);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkTheme(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  const handleNsfwFilterChange = (checked: boolean) => {
    setEnableNsfwFilter(checked);
    localStorage.setItem("nsfwFilter", String(checked));
  };

  const handleUpdateProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim() || undefined,
        authorName: authorName.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      await refreshProfile();
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!mounted) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <h1 className="text-4xl font-headline mb-10 text-center">Settings</h1>
        <div className="space-y-12">
          <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-4xl font-headline mb-10 text-center">Settings</h1>

      <div className="space-y-12">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserCircle className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline text-2xl">Account</CardTitle>
            </div>
            <CardDescription>Manage your account details and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-name">Author Name</Label>
              <Input
                id="author-name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your pen name (for published works)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell readers a little about yourself..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.primaryEmailAddress?.emailAddress ?? ""}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Email is managed by your account provider.</p>
            </div>
            <Button onClick={handleUpdateProfile} disabled={isSavingProfile}>
              {isSavingProfile ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
              ) : (
                "Update Profile"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline text-2xl">Notifications</CardTitle>
            </div>
            <CardDescription>Choose how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-chapter-notifs" className="flex-grow">New chapter releases</Label>
              <Switch id="new-chapter-notifs" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="comment-replies-notifs" className="flex-grow">Replies to your comments</Label>
              <Switch id="comment-replies-notifs" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="newsletter-notifs" className="flex-grow">Promotional newsletter</Label>
              <Switch id="newsletter-notifs" />
            </div>
          </CardContent>
        </Card>

        {/* Content Preferences */}
        <Card id="content-preferences">
          <CardHeader>
            <div className="flex items-center gap-3">
              <EyeOff className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline text-2xl">Content Preferences</CardTitle>
            </div>
            <CardDescription>Customize your content viewing experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="nsfw-filter" className="flex-grow">Enable NSFW Filter</Label>
              <Switch
                id="nsfw-filter"
                checked={enableNsfwFilter}
                onCheckedChange={handleNsfwFilterChange}
              />
            </div>
            <p className="text-sm text-muted-foreground">This helps hide content that may not be suitable for all audiences.</p>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline text-2xl">Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel of Novelosity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex-grow">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={isDarkTheme}
                onCheckedChange={handleThemeChange}
              />
            </div>
            <p className="text-sm text-muted-foreground">Theme settings are also available in the reader toolbar.</p>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline text-2xl">Security</CardTitle>
            </div>
            <CardDescription>Manage your account security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Password and account security are managed through your account provider (Clerk).</p>
            <Button variant="outline" asChild>
              <a href="https://accounts.novelosity.com/user" target="_blank" rel="noopener noreferrer">
                Manage Account Security
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
