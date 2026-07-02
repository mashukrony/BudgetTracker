"use client"

import * as React from "react"
import Link from "next/link"
import { BellRing, X } from "lucide-react"
import type { AppNotification } from "@/lib/types"
import { Button } from "@/components/ui/button"

const DISMISS_MS = 6000

export function NotificationAlertBanner({ notifications }: { notifications: AppNotification[] }) {
  const knownIdsRef = React.useRef<Set<string> | null>(null)
  const [alert, setAlert] = React.useState<AppNotification | null>(null)

  React.useEffect(() => {
    const currentIds = new Set(notifications.map((n) => n.id))

    if (knownIdsRef.current === null) {
      knownIdsRef.current = currentIds
      return
    }

    const newest = notifications.find((n) => !knownIdsRef.current!.has(n.id))
    knownIdsRef.current = currentIds

    if (newest) {
      setAlert(newest)
    }
  }, [notifications])

  React.useEffect(() => {
    if (!alert) return
    const timer = window.setTimeout(() => setAlert(null), DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [alert])

  if (!alert) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-50 flex w-[min(100vw-2rem,22rem)] items-start gap-3 rounded-lg border border-violet-200 bg-white p-4 shadow-lg animate-in fade-in-0 slide-in-from-top-2"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#667eea]/15 text-[#667eea]">
        <BellRing className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-foreground">New notification</p>
        <p className="text-sm text-muted-foreground">{alert.title}</p>
        <Link
          href="/notifications"
          className="text-xs font-medium text-[#667eea] hover:underline"
          onClick={() => setAlert(null)}
        >
          View all
        </Link>
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="shrink-0 text-muted-foreground"
        aria-label="Dismiss notification alert"
        onClick={() => setAlert(null)}
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
