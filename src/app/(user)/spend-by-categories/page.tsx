"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AlertTriangle, TrendingDown } from "lucide-react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { formatMoney } from "@/lib/format-money"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function SpendByCategoriesPage() {
  const { currencyCode, categories, spendMap, monthlyBudget, overallRemaining, isIncomeCategory } =
    useBudgetApp()

  const rows = categories
    .filter((c) => !isIncomeCategory(c))
    .map((c) => {
      const spent = spendMap[c.id] ?? 0
      const remaining = Math.max(0, c.budgetAllocated - spent)
      const over = spent > c.budgetAllocated
      return {
        ...c,
        spent,
        remaining,
        over,
      }
    })
    .sort((a, b) => b.spent - a.spent)

  const exceeded = rows.filter((r) => r.over).length

  const allocatedOverall = categories
    .filter((c) => !isIncomeCategory(c))
    .reduce((s, c) => s + c.budgetAllocated, 0)

  const chartRows = rows.map((r) => ({
    name: r.name.length > 10 ? `${r.name.slice(0, 9)}…` : r.name,
    Spent: Math.round(r.spent),
    Allocation: Math.round(r.budgetAllocated),
  }))

  const insights = [...rows]
    .filter((r) => r.spent > 0)
    .slice(0, 4)
    .map((r) => ({
      ...r,
      utilization: Math.round((r.spent / Math.max(r.budgetAllocated, 1)) * 100),
    }))

  const alerts = rows.filter((r) => r.over || r.remaining / Math.max(r.budgetAllocated, 1) <= 0.1)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Spend by categories</h1>
        <p className="mt-1 text-muted-foreground">
          Where money leaves fastest — surfaced with allocation, pacing, and risk flags.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 border-l-4 border-l-violet-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Allocated across categories</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatMoney(allocatedOverall, currencyCode)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 border-l-4 border-l-teal-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Unused headroom vs monthly plan</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatMoney(overallRemaining, currencyCode)}
            </CardTitle>
            <CardDescription>(month ceiling {formatMoney(monthlyBudget, currencyCode)})</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/80 border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Budgets exceeding plan</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{exceeded}</CardTitle>
            <CardDescription>Categories where spend surpassed allocation.</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/80 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Spent vs allocation</CardTitle>
            <CardDescription>Visual comparison bar chart (no weekly/monthly strip — totals are rolling).</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px] min-h-[280px] min-w-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartRows} margin={{ top: 8, left: -8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" interval={0} angle={-20} height={70} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RTooltip
                  formatter={(value) => [
                    formatMoney(Number(value ?? 0), currencyCode),
                    "",
                  ]}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Bar dataKey="Allocation" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#f56565" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top pacing</CardTitle>
            <CardDescription>Ranked utilization — top insight panel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(r.spent, currencyCode)} of{" "}
                    {formatMoney(r.budgetAllocated, currencyCode)}
                  </p>
                </div>
                <Badge variant={r.utilization >= 100 ? "destructive" : "secondary"}>
                  {r.utilization}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
            <AlertTriangle className="size-4 text-amber-600" />
            Budget alerts on this view
          </CardTitle>
          <CardDescription>At-risk or exceeded envelopes — surfaced for quick corrective action.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {alerts.length === 0 ? (
              <li>No risk flags right now.</li>
            ) : (
              alerts.map((a) => (
                <li key={a.id} className="flex flex-wrap gap-2">
                  <TrendingDown className="size-4 shrink-0 text-red-500" aria-hidden />
                  <span>
                    <span className="font-medium text-foreground">{a.name}</span>
                    {": "}
                    {a.over
                      ? `Exceeded allocation by ${formatMoney(a.spent - a.budgetAllocated, currencyCode)}.`
                      : `Only ${formatMoney(a.remaining, currencyCode)} left before hitting the envelope cap.`}
                  </span>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Detailed grid</CardTitle>
          <CardDescription>Spend, allocation, and remaining per envelope.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(r.budgetAllocated, currencyCode)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(r.spent, currencyCode)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(r.budgetAllocated - r.spent, currencyCode)}
                    </TableCell>
                    <TableCell className="hidden text-right md:table-cell">
                      {r.over ? (
                        <Badge variant="destructive">Over budget</Badge>
                      ) : r.remaining / Math.max(r.budgetAllocated, 1) <= 0.25 ? (
                        <Badge variant="secondary">Watch</Badge>
                      ) : (
                        <Badge variant="outline">Healthy</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
