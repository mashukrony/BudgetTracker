"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Car, Pizza, ShoppingBag, TrendingUp, Tv, TrendingDown } from "lucide-react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { sortTransactions } from "@/lib/derive-snapshot-metrics"
import { formatMoney } from "@/lib/format-money"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CurrencyCode } from "@/lib/types"
import type { UserBudgetSnapshot } from "@/lib/queries/user-snapshot"

const MONTH_NAME = new Date().toLocaleString("default", { month: "long" })

function formatDelta(pct: number | null, kind: "income" | "expense"): string {
  if (pct === null) return "No prior-month data"
  const sign = pct > 0 ? "+" : ""
  const label = kind === "income" ? "income" : "spend"
  return `${sign}${pct}% vs last month (${label})`
}

function categoryIcon(categoryName: string) {
  const n = categoryName.toLowerCase()
  if (n.includes("food") || n.includes("dining"))
    return { Icon: Pizza, className: "bg-amber-500" }
  if (n.includes("transport")) return { Icon: Car, className: "bg-sky-500" }
  if (n.includes("shop")) return { Icon: ShoppingBag, className: "bg-violet-500" }
  if (n.includes("entertain"))
    return { Icon: Tv, className: "bg-pink-500" }
  return { Icon: TrendingUp, className: "bg-emerald-500" }
}

export default function DashboardPage() {
  const {
    currencyCode,
    userDisplayName,
    monthlyIncome,
    monthlyBudget,
    totalExpenseThisMonth,
    overallRemaining,
    categories,
    spendMap,
    transactions,
    periodComparison,
    incomeDeltaPct,
    expenseDeltaPct,
    isIncomeCategory,
  } = useBudgetApp()

  const [activePie, setActivePie] = React.useState<number | undefined>(undefined)
  const [compareOpen, setCompareOpen] = React.useState(false)

  const savings = Math.max(0, monthlyIncome - totalExpenseThisMonth)

  const rawPie = [
    { key: "spent", name: "Total spent", value: totalExpenseThisMonth, fill: "#f56565" },
    { key: "remain", name: "Remaining", value: overallRemaining, fill: "#2dd4bf" },
  ]
  const pieData = rawPie.filter((d) => d.value > 0)

  const barRows = categories
    .filter((c) => !isIncomeCategory(c))
    .map((c) => ({
      name: c.name.length > 12 ? `${c.name.slice(0, 11)}…` : c.name,
      spent: Math.round(spendMap[c.id] ?? 0),
      budget: c.budgetAllocated,
    }))
    .filter((row) => row.budget > 0)

  const topCategories = [...categories]
    .filter((c) => !isIncomeCategory(c) && c.budgetAllocated > 0)
    .map((c) => ({
      ...c,
      spent: spendMap[c.id] ?? 0,
      pct: ((spendMap[c.id] ?? 0) / c.budgetAllocated) * 100,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6)

  const recent = sortTransactions(transactions).slice(0, 5)

  const budgetLabel = `${formatMoney(monthlyBudget, currencyCode)} monthly plan`

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-muted-foreground md:text-2xl">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              {userDisplayName}
            </span>
            !
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep overspending in check — your budget pulse for {MONTH_NAME}.
          </p>
        </div>
        <Button
          className="shrink-0 bg-[#667eea] hover:bg-[#5b21b6]"
          onClick={() => setCompareOpen(true)}
        >
          Compare periods
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Monthly income"
          value={formatMoney(monthlyIncome, currencyCode)}
          delta={formatDelta(incomeDeltaPct, "income")}
          positive={(incomeDeltaPct ?? 0) >= 0}
          accent="border-l-emerald-500"
        />
        <StatCard
          title="Total expenses"
          value={formatMoney(totalExpenseThisMonth, currencyCode)}
          delta={formatDelta(expenseDeltaPct, "expense")}
          positive={(expenseDeltaPct ?? 0) <= 0}
          accent="border-l-orange-400"
        />
        <StatCard
          title="Savings outlook"
          value={formatMoney(savings, currencyCode)}
          delta="Room after expenses"
          positive
          accent="border-l-sky-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Budget overview</CardTitle>
            <CardDescription>
              Your budget {formatMoney(monthlyBudget, currencyCode)} — tap a slice for details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="donut" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="donut">Donut</TabsTrigger>
                <TabsTrigger value="bars">Bar chart</TabsTrigger>
              </TabsList>
              <TabsContent value="donut" className="pt-4">
                <p className="mb-4 text-center text-sm text-muted-foreground">{budgetLabel}</p>
                <div className="mx-auto h-[260px] min-h-[260px] w-full max-w-md min-w-0">
                  {pieData.length === 0 ? (
                    <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                      Set a monthly budget and add expenses to visualize this chart.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={88}
                          paddingAngle={2}
                          onMouseEnter={(_, i) => setActivePie(i)}
                          onMouseLeave={() => setActivePie(undefined)}
                        >
                          {pieData.map((entry, i) => (
                            <Cell
                              key={entry.key}
                              fill={entry.fill}
                              opacity={activePie === undefined || activePie === i ? 1 : 0.45}
                              stroke={activePie === i ? "#111827" : "transparent"}
                              strokeWidth={activePie === i ? 2 : 0}
                              className="cursor-pointer transition-opacity"
                            />
                          ))}
                        </Pie>
                        <RTooltip
                          formatter={(value) => [
                            formatMoney(Number(value ?? 0), currencyCode),
                            "",
                          ]}
                          contentStyle={{ borderRadius: 8 }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <p className="text-lg font-semibold">
                      {formatMoney(totalExpenseThisMonth, currencyCode)}
                    </p>
                    <p className="text-muted-foreground">Total spent</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {formatMoney(overallRemaining, currencyCode)}
                    </p>
                    <p className="text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="bars" className="pt-4">
                <div className="h-[280px] min-h-[240px] min-w-0 w-full">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RTooltip
                        formatter={(value) => [
                          formatMoney(Number(value ?? 0), currencyCode),
                          "",
                        ]}
                        contentStyle={{ borderRadius: 8 }}
                      />
                      <Legend />
                      <Bar dataKey="spent" name="Spent" fill="#f56565" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="budget" name="Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">This month by category</CardTitle>
              <CardDescription>Largest use of allocated budget</CardDescription>
            </div>
            <span className="text-sm text-muted-foreground">{MONTH_NAME}</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0"
              >
                <span className="text-sm font-medium">{c.name}</span>
                <div className="text-right text-sm">
                  <span className="font-semibold tabular-nums">
                    {formatMoney(c.spent, currencyCode)}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    / {formatMoney(c.budgetAllocated, currencyCode)} budget
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent transactions</CardTitle>
          <CardDescription>Latest activity across your categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {recent.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId)
            const { Icon, className } = categoryIcon(cat?.name ?? "")
            const sign = t.type === "income" ? "+" : "-"
            return (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 border-b border-border/50 py-3 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full text-white ${className}`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat?.name ?? "—"} • {t.date}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    t.type === "income" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {sign}
                  {formatMoney(t.amount, currencyCode)}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <CompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        currencyCode={currencyCode}
        comparison={periodComparison}
      />
    </div>
  )
}

function StatCard({
  title,
  value,
  delta,
  positive,
  accent,
}: {
  title: string
  value: string
  delta: string
  positive: boolean
  accent: string
}) {
  return (
    <Card className={`border-border/80 border-l-4 shadow-sm ${accent}`}>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-bold tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-1 text-xs">
        {positive ? (
          <TrendingUp className="size-3.5 text-emerald-600" />
        ) : (
          <TrendingDown className="size-3.5 text-red-500" />
        )}
        <span className={positive ? "text-emerald-600" : "text-red-500"}>{delta}</span>
      </CardContent>
    </Card>
  )
}

function CompareDialog({
  open,
  onOpenChange,
  currencyCode,
  comparison,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  currencyCode: CurrencyCode
  comparison: UserBudgetSnapshot["periodComparison"]
}) {
  const { previous: prev, current: cur } = comparison
  const rows = [
    { metric: "Budget", prev: prev.budget, cur: cur.budget },
    { metric: "Spent", prev: prev.spent, cur: cur.spent },
    { metric: "Remaining", prev: prev.remaining, cur: cur.remaining },
    { metric: "Top category", prev: prev.topCategoryName, cur: cur.topCategoryName },
  ]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compare with last month</DialogTitle>
          <DialogDescription>
            Aggregated from your Neon PostgreSQL budgets and expense transactions.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Previous</TableHead>
              <TableHead>Current</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.metric}>
                <TableCell className="font-medium">{r.metric}</TableCell>
                <TableCell>
                  {typeof r.prev === "number" ? formatMoney(r.prev, currencyCode) : r.prev}
                </TableCell>
                <TableCell>
                  {typeof r.cur === "number" ? formatMoney(r.cur, currencyCode) : r.cur}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
