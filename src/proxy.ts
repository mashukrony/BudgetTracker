import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { isAdminRole, roleFromSessionClaims } from "@/lib/clerk-role"

/** Paths that must stay public (Clerk UI + internal). */
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
])

const isUserRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/budget(.*)",
  "/categories(.*)",
  "/transactions(.*)",
  "/spend-by-categories(.*)",
  "/notifications(.*)",
  "/help-support(.*)",
  "/account(.*)",
])

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

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
  "/auth/post-sign-in(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return

  if (!isProtectedRoute(req)) return

  await auth.protect()

  const { sessionClaims } = await auth()
  const role = roleFromSessionClaims(sessionClaims)
  const admin = isAdminRole(role)

  if (isAdminRoute(req) && !admin) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (isUserRoute(req) && admin) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
}
