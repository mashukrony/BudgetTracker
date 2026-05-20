import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

/** Paths that must stay public (Clerk UI + internal). */
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
])

/** All App Router URLs under `(user)` and `admin` (route groups are not in the URL). */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/budget(.*)",
  "/categories(.*)",
  "/transactions(.*)",
  "/spend-by-categories(.*)",
  "/notifications(.*)",
  "/help-support(.*)",
  "/account(.*)",
  "/admin(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
}
