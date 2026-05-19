import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { NavMenu } from '@/components/nav-menu';
import { SiteHeader } from '@/components/site-header';
import { Logo } from '@/components/logo';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { SidebarLoginButton } from '@/components/SidebarLoginButton';

export const metadata: Metadata = {
  title: {
    default: 'Novelosity - Your Universe of Stories to Read and Write',
    template: '%s | Novelosity',
  },
  description: 'Discover captivating novels, engage with a vibrant community of readers and authors, and unleash your creativity on Novelosity.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-body antialiased">
          <AuthProvider>
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
                      <SidebarLoginButton />
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
          </AuthProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
