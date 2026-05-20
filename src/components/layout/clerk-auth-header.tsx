"use client"

import { usePathname } from "next/navigation"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

function isAuthPath(pathname: string | null) {
  if (!pathname) return false
  return (
    pathname === "/sign-in" ||
    pathname.startsWith("/sign-in/") ||
    pathname === "/sign-up" ||
    pathname.startsWith("/sign-up/")
  )
}

export function ClerkAuthHeader() {
  const pathname = usePathname()
  if (isAuthPath(pathname)) return null

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton>
          <button
            type="button"
            className="h-10 cursor-pointer rounded-full bg-purple-700 px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base"
          >
            Sign Up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  )
}
