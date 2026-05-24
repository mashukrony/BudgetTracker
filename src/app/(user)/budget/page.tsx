"use client"

import * as React from "react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { formatMoney } from "@/lib/format-money"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BudgetPage() {
  const {
    currencyCode,
    monthlyBudget,
    setMonthlyBudget,
    categories,
    spendMap,
    totalExpenseThisMonth,
    isIncomeCategory,
  } = useBudgetApp()

  const [draft, setDraft] = React.useState(monthlyBudget.toString())

  React.useEffect(() => {
    setDraft(monthlyBudget.toString())
  }, [monthlyBudget])

  const assigned = categories.filter(
    (c) => !isIncomeCategory(c) && c.budgetAllocated > 0
  )
  const overCount = assigned.filter((c) => (spendMap[c.id] ?? 0) > c.budgetAllocated).length

  const [saving, setSaving] = React.useState(false)

  const applyBudget = async () => {
    const n = Number.parseFloat(draft.replace(/,/g, ""))
    if (!Number.isFinite(n) || n < 0) return
    setSaving(true)
    try {
      await setMonthlyBudget(n)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not save budget.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Monthly budget</h1>
        <p className="mt-1 text-muted-foreground">
          Define your ceiling for {new Date().toLocaleString("default", { month: "long" })} — progress
          updates from recorded expenses.
        </p>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Set overall monthly budget</CardTitle>
          <CardDescription>This cap drives remaining balance and alerts on other pages.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="mb">Monthly budget ({currencyCode})</Label>
            <Input
              id="mb"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. 8500"
            />
          </div>
          <Button
            className="bg-[#667eea] hover:bg-[#5b21b6]"
            type="button"
            disabled={saving}
            onClick={() => void applyBudget()}
          >
            {saving ? "Saving…" : "Save budget"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Summary title="Monthly budget" value={formatMoney(monthlyBudget, currencyCode)} />
        <Summary title="Total spent" value={formatMoney(totalExpenseThisMonth, currencyCode)} />
        <Summary title="Categories with budget" value={String(assigned.length)} />
        <Summary
          title="Over budget"
          value={String(overCount)}
          hint="Categories where spend exceeds allocation"
        />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Category budgets</CardTitle>
          <CardDescription>Allocate and track — bars show spend vs plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {assigned.map((c) => {
            const spent = spendMap[c.id] ?? 0
            const pct = Math.min(100, (spent / Math.max(c.budgetAllocated, 1)) * 100)
            const over = spent > c.budgetAllocated
            return (
              <div key={c.id} className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm text-muted-foreground">
                    <span className={over ? "font-semibold text-destructive" : ""}>
                      {formatMoney(spent, currencyCode)}
                    </span>{" "}
                    / {formatMoney(c.budgetAllocated, currencyCode)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: over ? "#ef4444" : "#667eea",
                    }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

function Summary({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-bold tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  )
}
