
// src/app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Bell, ShieldCheck, Palette, EyeOff } from "lucide-react";

export default function SettingsPage() {
  useEffect(() => {
    document.title = "Settings | Novelosity";
  }, []);

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [enableNsfwFilter, setEnableNsfwFilter] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Theme initialization
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      const newIsDarkTheme = savedTheme === "dark";
      setIsDarkTheme(newIsDarkTheme);
      document.documentElement.classList.toggle("dark", newIsDarkTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkTheme(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }

    // NSFW filter initialization
    const savedNsfwFilter = localStorage.getItem("nsfwFilter");
    if (savedNsfwFilter) {
      setEnableNsfwFilter(savedNsfwFilter === "true");
    }
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkTheme(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  const handleNsfwFilterChange = (checked: boolean) => {
    setEnableNsfwFilter(checked);
    localStorage.setItem("nsfwFilter", String(checked));
    alert(`NSFW Filter ${checked ? 'Enabled' : 'Disabled'} (UI Only)`);
  };

  if (!mounted) {
    // Render minimal UI or skeleton while waiting for client-side mount
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
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="BookLover123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="user@example.com" />
            </div>
            <Button onClick={() => alert("Update Profile clicked (UI Only)")}>Update Profile</Button>
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
              <Switch id="new-chapter-notifs" defaultChecked onCheckedChange={(c) => alert(`New chapter release notifications: ${c}`)}/>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="comment-replies-notifs" className="flex-grow">Replies to your comments</Label>
              <Switch id="comment-replies-notifs" defaultChecked onCheckedChange={(c) => alert(`Comment reply notifications: ${c}`)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="newsletter-notifs" className="flex-grow">Promotional newsletter</Label>
              <Switch id="newsletter-notifs" onCheckedChange={(c) => alert(`Promotional newsletter: ${c}`)} />
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
            <Button variant="outline" onClick={() => alert("Change Password clicked (UI Only)")}>Change Password</Button>
            <Button variant="destructive" onClick={() => alert("Delete Account clicked (UI Only)")}>Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
