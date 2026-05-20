"use client"

import * as React from "react"
import { BellRing, ChevronDown, Trash2 } from "lucide-react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const TRIGGER_HINTS: Record<string, string> = {
  category_threshold: "Triggered when pacing suggests a category may exceed its allocation.",
  over_budget: "Triggered when recorded spend crosses the allocation for that category.",
  threshold: "Triggered when spend reaches the category budget cap.",
  savings: "Highlights leftover budget versus your monthly plan.",
  insight: "Aggregated from your recent transactions and category totals.",
}

export default function NotificationsPage() {
  const { notifications, deleteNotification } = useBudgetApp()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-muted-foreground">
          Budget alerts, insights, and reminders — expand optional details.
        </p>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BellRing className="size-4" />
            What generates these?
          </CardTitle>
          <CardDescription>
            Category limits, recurring payments (when synced), monthly savings versus plan, and ranked
            spending insights. Wire your rules or backend to replace this demo behavior.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              You are all caught up — no notifications right now.
            </CardContent>
          </Card>
        ) : (
          notifications.map((n) => (
            <NotificationRow
              key={n.id}
              title={n.title}
              body={n.body}
              createdAt={n.createdAt}
              hint={TRIGGER_HINTS[n.kind] ?? "System notification"}
              onDelete={() => deleteNotification(n.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function NotificationRow({
  title,
  body,
  createdAt,
  hint,
  onDelete,
}: {
  title: string
  body: string
  createdAt: string
  hint: string
  onDelete: () => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-start gap-2 space-y-0 pb-2">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base leading-snug">{title}</CardTitle>
            <CardDescription>{new Date(createdAt).toLocaleString()}</CardDescription>
          </div>
          <div className="flex shrink-0 gap-1">
            <CollapsibleTrigger
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
            >
              View
              <ChevronDown
                className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              aria-label="Delete notification"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <p className="text-sm text-muted-foreground">{body}</p>
          <CollapsibleContent className="data-open:animate-in data-open:fade-in-0">
            <Badge variant="secondary" className="text-xs font-normal">
              {hint}
            </Badge>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  )
}
