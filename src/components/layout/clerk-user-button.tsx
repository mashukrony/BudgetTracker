"use client"

import { UserButton } from "@clerk/nextjs"
import { useEffect, useState } from "react"

/** Avoids Clerk UserButton SSR/client markup mismatches (hydration warnings). */
export function ClerkUserButton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span aria-hidden className="inline-block size-9 shrink-0 rounded-full bg-muted" />
  }

  return <UserButton />
}
