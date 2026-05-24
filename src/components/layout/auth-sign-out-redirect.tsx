"use client"

import { useAuth } from "@clerk/nextjs"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

const PUBLIC_PREFIXES = ["/sign-in", "/sign-up"]

function isPublicPath(pathname: string | null) {
  if (!pathname) return false
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/** Ensures signed-out users (e.g. UserButton sign-out) land on /sign-in. */
export function AuthSignOutRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded || isSignedIn || isPublicPath(pathname)) return
    router.replace("/sign-in")
  }, [isLoaded, isSignedIn, pathname, router])

  return null
}
