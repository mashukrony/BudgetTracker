"use client"

import { UserProfile } from "@clerk/nextjs"

export default function AdminAccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Admin account</h1>
        <p className="mt-1 text-muted-foreground">
          Update email, password, and profile image through Clerk. Admin access is controlled from
          the Clerk dashboard (public metadata{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">role: admin</code>).
        </p>
      </header>

      <div className="flex w-full justify-center">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full max-w-full shadow-none",
              card: "shadow-sm border border-border/80",
            },
          }}
        />
      </div>
    </div>
  )
}
