"use client"

import { Activity, BarChart4, Layers3, ShieldCheck, UsersRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/** Admin home — KPI surface area before historic analytics arrives. */

export default function AdminDashboardPage() {
  const router = useRouter()
  const { adminDemoUsers, supportMessages } = useBudgetApp()
  const activeUsers = adminDemoUsers.filter((u) => u.status === "Active").length
  const openTickets = supportMessages.length

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-muted-foreground">
          Suggested building blocks: platform health, engagement funnels, compliance exports, and proactive risk
          panels — below is a lightweight placeholder aligned with your mock data.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={UsersRound} label="Total users" value={String(adminDemoUsers.length)} hint="Directory table" />
        <Kpi icon={Activity} label="Active accounts" value={String(activeUsers)} hint="Status = Active" />
        <Kpi icon={Layers3} label="Support inbox" value={String(openTickets)} hint="Unresolved messages" />
        <Kpi
          icon={ShieldCheck}
          label="Integrity checks"
          value="OK"
          hint="Synthetic — wire audit jobs here"
          tone="positive"
        />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart4 className="size-5" />
            Ideas to implement next
          </CardTitle>
          <CardDescription>
            Use them as epics when you connect auth, databases, and scheduled jobs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Idea
            title="Activation cohorts"
            body="Track users who set a budget + first transaction within 7 days to measure onboarding quality."
          />
          <Idea
            title="Spend anomaly radar"
            body="Flag accounts with category velocity spikes compared to their trailing 3-month median."
          />
          <Idea
            title="Admin broadcast"
            body="Announce maintenance or policy tweaks as forced dismissible banners in-app."
          />
          <Idea
            title="Data export APIs"
            body="SOC2-ready CSV/JSON exports for finance audits with watermarking."
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
          onClick={() => router.push("/admin/users")}
        >
          Jump to Manage Users
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin/qa")}>
          Open Q&A
        </Button>
      </div>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof UsersRound
  label: string
  value: string
  hint: string
  tone?: "positive"
}) {
  return (
    <Card
      className={`border-border/80 border-l-4 shadow-sm ${
        tone === "positive" ? "border-l-emerald-500" : "border-l-sky-500"
      }`}
    >
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <Icon className="size-4 text-muted-foreground" />
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function Idea({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
