import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// These routes require the user to be signed in
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/author(.*)',
  '/author-dashboard(.*)',
  '/messages(.*)',
  '/settings(.*)',
  '/admin(.*)',
  '/editorial-dashboard(.*)',
  '/author-communication(.*)',
  '/content-moderation(.*)',
  '/tools(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
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
