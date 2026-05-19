"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, LogIn as LogInIcon, UserPlus, User, AlertCircle, CheckCircle, PenTool, BookOpen } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, resetPassword, user, isLoading } = useAuth();
  const router = useRouter();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("reader");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Login or Register | Novelosity";
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(loginEmail, loginPassword);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Login failed';
      setError(friendlyError(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!regName.trim()) { setError("Please enter your name."); return; }
    if (regPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (regPassword !== regConfirm) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try {
      await signUp(regEmail, regPassword, regName.trim(), regRole);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Registration failed';
      setError(friendlyError(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Google sign-in failed';
      setError(friendlyError(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await resetPassword(forgotEmail);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to send reset email';
      setError(friendlyError(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (showForgot) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-var(--header-height,8rem))] items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Reset Password</CardTitle>
            <CardDescription>Enter your email to receive a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="mb-4 border-green-500"><CheckCircle className="h-4 w-4 text-green-500" /><AlertDescription>{success}</AlertDescription></Alert>}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="forgot-email" type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setShowForgot(false); setError(""); setSuccess(""); }}>
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-var(--header-height,8rem))] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <LogInIcon className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Welcome to Novelosity</CardTitle>
          <CardDescription>Sign in or create a new account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" onValueChange={() => setError("")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            {/* ── LOGIN ── */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Signing in..." : <><LogInIcon className="mr-2 h-4 w-4" /> Sign In</>}
                </Button>
                <div className="text-sm text-center">
                  <button type="button" onClick={() => { setShowForgot(true); setError(""); }} className="font-medium text-primary hover:underline">
                    Forgot your password?
                  </button>
                </div>
              </form>
            </TabsContent>

            {/* ── REGISTER ── */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="reg-name" type="text" placeholder="Your name" value={regName} onChange={(e) => setRegName(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="reg-email" type="email" placeholder="you@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="reg-password" type="password" placeholder="Min. 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="reg-confirm" type="password" placeholder="Repeat password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>I want to join as</Label>
                  <RadioGroup value={regRole} onValueChange={(v) => setRegRole(v as UserRole)} className="grid grid-cols-2 gap-3">
                    <Label htmlFor="role-reader" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                      <RadioGroupItem value="reader" id="role-reader" className="sr-only" />
                      <BookOpen className="mb-2 h-6 w-6" />
                      <span className="font-semibold">Reader</span>
                      <span className="text-xs text-muted-foreground mt-1">Browse & read novels</span>
                    </Label>
                    <Label htmlFor="role-author" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                      <RadioGroupItem value="author" id="role-author" className="sr-only" />
                      <PenTool className="mb-2 h-6 w-6" />
                      <span className="font-semibold">Author</span>
                      <span className="text-xs text-muted-foreground mt-1">Write & publish stories</span>
                    </Label>
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating account..." : <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><Separator /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={submitting}>
            <GoogleIcon /> Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function friendlyError(msg: string): string {
  if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) return 'Invalid email or password.';
  if (msg.includes('email-already-in-use')) return 'An account with this email already exists.';
  if (msg.includes('weak-password')) return 'Password is too weak. Use at least 6 characters.';
  if (msg.includes('invalid-email')) return 'Please enter a valid email address.';
  if (msg.includes('popup-closed')) return 'Sign-in popup was closed. Please try again.';
  if (msg.includes('network-request-failed')) return 'Network error. Check your connection and try again.';
  if (msg.includes('too-many-requests')) return 'Too many attempts. Please wait before trying again.';
  return msg;
}
