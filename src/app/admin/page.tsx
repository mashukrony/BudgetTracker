"use client"

import { Activity, BarChart4, Layers3, ShieldCheck, UsersRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAdminApp } from "@/contexts/admin-app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { totalUsers, openTickets, supportMessages } = useAdminApp()
  const activeAccounts = totalUsers

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-muted-foreground">
          Platform health from your Neon database — user directory is managed in Clerk.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={UsersRound} label="Registered users" value={String(totalUsers)} hint="Prisma User rows" />
        <Kpi icon={Activity} label="Accounts in DB" value={String(activeAccounts)} hint="Synced from Clerk" />
        <Kpi icon={Layers3} label="Open tickets" value={String(openTickets)} hint="Status OPEN" />
        <Kpi
          icon={ShieldCheck}
          label="Inbox total"
          value={String(supportMessages.length)}
          hint="All support tickets"
          tone="positive"
        />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart4 className="size-5" />
            Operations
          </CardTitle>
          <CardDescription>Jump to user management or the support inbox.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
            onClick={() => router.push("/admin/users")}
          >
            Manage Users
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/qa")}>
            Open Q&A
          </Button>
        </CardContent>
      </Card>
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
