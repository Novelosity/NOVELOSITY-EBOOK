"use client";

import { Suspense } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn as LogInIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const appearance = {
  elements: {
    card: "shadow-none border border-border rounded-lg",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
  },
};

function LoginContent() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "register" ? "register" : "login";

  useEffect(() => {
    if (isSignedIn) router.push("/browse");
  }, [isSignedIn, router]);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <LogInIcon className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-headline text-primary">Welcome to Novelosity</h1>
          <p className="text-muted-foreground mt-1">Sign in or create a new account.</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => router.replace(`/login?tab=${v}`)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="flex justify-center">
            <SignIn routing="virtual" fallbackRedirectUrl="/browse" appearance={appearance} />
          </TabsContent>

          <TabsContent value="register" className="flex justify-center">
            <SignUp routing="virtual" fallbackRedirectUrl="/browse" appearance={appearance} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
