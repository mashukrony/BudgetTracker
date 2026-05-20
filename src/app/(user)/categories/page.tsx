"use client"

import * as React from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { formatMoney } from "@/lib/format-money"
import type { Category } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CategoriesPage() {
  const {
    currencyCode,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    spendMap,
  } = useBudgetApp()

  const [dialog, setDialog] = React.useState<
    null | { mode: "create" } | { mode: "edit"; category: Category }
  >(null)

  const [name, setName] = React.useState("")
  const [budget, setBudget] = React.useState("")

  const openCreate = () => {
    setName("")
    setBudget("")
    setDialog({ mode: "create" })
  }

  const openEdit = (c: Category) => {
    setName(c.name)
    setBudget(String(c.budgetAllocated))
    setDialog({ mode: "edit", category: c })
  }

  const save = () => {
    const b = Number.parseFloat(budget.replace(/,/g, ""))
    if (!name.trim() || !Number.isFinite(b) || b < 0) return
    if (dialog?.mode === "create") addCategory(name, b)
    if (dialog?.mode === "edit") updateCategory(dialog.category.id, name, b)
    setDialog(null)
  }

  const count = categories.filter((c) => c.id !== "cat-income").length

  const budgetCategories = categories.filter((c) => c.id !== "cat-income")

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-muted-foreground">
            You have <Badge variant="secondary">{count}</Badge> categories · assign a monthly budget to each
            envelope to track spending against it.
          </p>
        </div>
        <Button className="bg-[#667eea] hover:bg-[#5b21b6]" onClick={openCreate}>
          <Plus className="size-4" />
          Add category
        </Button>
      </header>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Overview</CardTitle>
          <CardDescription>Budget envelopes that feed charts and alerts everywhere else.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Spend</TableHead>
                  <TableHead className="text-right">Monthly budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetCategories.map((c) => {
                  const spent = spendMap[c.id] ?? 0
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="hidden tabular-nums sm:table-cell">
                        {formatMoney(spent, currencyCode)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(c.budgetAllocated, currencyCode)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => openEdit(c)}
                            aria-label="Edit category"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteCategory(c.id)}
                            aria-label="Delete category"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "edit" ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>
              Planned monthly allocation influences progress bars on Budget and Spend pages.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-budget">Monthly budget ({currencyCode})</Label>
              <Input
                id="c-budget"
                inputMode="decimal"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button className="bg-[#667eea] hover:bg-[#5b21b6]" onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
