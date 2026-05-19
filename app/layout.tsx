
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { NavMenu } from '@/components/nav-menu';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { RoleProvider } from '@/contexts/RoleContext';

export const metadata: Metadata = {
  title: {
    default: 'Novelosify - Your Universe of Stories to Read and Write',
    template: '%s | Novelosity',
  },
  description: 'Discover captivating novels, engage with a vibrant community of readers and authors, and unleash your creativity with powerful writing tools on Novelosity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <RoleProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar collapsible="icon" className="border-r">
                <SidebarHeader className="p-4 flex justify-center items-center">
                  <Logo />
                </SidebarHeader>
                <SidebarContent className="p-2">
                  <NavMenu />
                </SidebarContent>
                <SidebarFooter className="p-4 mt-auto">
                  <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login / Register
                    </Link>
                  </Button>
                </SidebarFooter>
              </Sidebar>
              <SidebarInset className="flex-1 flex flex-col">
                <SiteHeader />
                <main className="flex-1 p-6 overflow-auto">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </RoleProvider>
        <Toaster />
      </body>
    </html>
  );
}
