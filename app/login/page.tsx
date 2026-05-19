
// src/app/login/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, LogIn as LogInIcon, UserPlus, Globe, Smartphone, MessageCircle } from "lucide-react"; // Using Smartphone for Apple, Globe for Google, MessageCircle for Facebook as placeholders
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    document.title = "Login or Register | Novelosity";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Login attempt with Email: ${email}`);
    // Add actual login logic here
  };

  const handleEmailRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Registration attempt with Email: ${email}`);
    // Add actual registration logic here
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Attempting to login with ${provider}`);
    // Add actual social login logic here
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-var(--header-height,8rem))] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <LogInIcon className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Welcome to Novelosity</CardTitle>
          <CardDescription>Sign in to continue or create an account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1">
                <LogInIcon className="mr-2 h-4 w-4" /> Login
              </Button>
              <Button type="button" variant="outline" onClick={handleEmailRegister} className="flex-1">
                <UserPlus className="mr-2 h-4 w-4" /> Register
              </Button>
            </div>
            <div className="text-sm text-center">
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  alert("Forgot password process (UI Placeholder)"); 
                }} 
                className="font-medium text-primary hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => handleSocialLogin("Google")}>
              <Globe className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" onClick={() => handleSocialLogin("Apple")}>
              <Smartphone className="mr-2 h-4 w-4" /> Apple
            </Button>
            <Button variant="outline" onClick={() => handleSocialLogin("Facebook")}>
              <MessageCircle className="mr-2 h-4 w-4" /> Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
