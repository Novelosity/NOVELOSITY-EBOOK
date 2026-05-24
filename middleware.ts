import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// These routes require the user to be signed in
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/author(.*)',
  '/author-dashboard(.*)',
  '/messages(.*)',
  '/settings(.*)',
  '/admin(.*)',
  '/admin-portal(.*)',
  '/editorial-dashboard(.*)',
  '/editor-portal(.*)',
  '/author-communication(.*)',
  '/content-moderation(.*)',
  '/tools(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { nextUrl } = req;
  const hostname = req.headers.get('host') || '';

  // Strip port number for subdomain detection
  const domain = hostname.split(':')[0];

  // Detect subdomain for novelosity.com and *.localhost (local dev)
  let subdomain: string | null = null;
  if (domain.endsWith('.novelosity.com')) {
    const sub = domain.slice(0, domain.length - '.novelosity.com'.length);
    if (sub && sub !== 'www') subdomain = sub;
  } else if (domain.endsWith('.localhost')) {
    subdomain = domain.slice(0, domain.length - '.localhost'.length);
  }

  // Route editor/admin subdomains to their portal paths
  if (subdomain === 'editor' || subdomain === 'admin') {
    await auth.protect();
    const portalBase = subdomain === 'editor' ? '/editor-portal' : '/admin-portal';
    const suffix = nextUrl.pathname === '/' ? '' : nextUrl.pathname;
    const rewriteUrl = new URL(`${portalBase}${suffix}`, req.url);
    rewriteUrl.search = nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
