"use client"

import * as React from "react"
import { FileDown, FileText, Mic, Plus } from "lucide-react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { formatMoney } from "@/lib/format-money"
import type { Transaction, TxType } from "@/lib/types"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Category } from "@/lib/types"

function categoryNameById(categories: Category[], id: string | null, fallback: string) {
  if (!id) return fallback
  if (id === "all") return "All categories"
  return categories.find((c) => c.id === id)?.name ?? fallback
}

export default function TransactionsPage() {
  const { currencyCode, categories, transactions, addTransaction } = useBudgetApp()
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [addOpen, setAddOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    return transactions.filter((t) => {
      if (categoryFilter !== "all" && t.categoryId !== categoryFilter) return false
      if (from && t.date < from) return false
      if (to && t.date > to) return false
      return true
    })
  }, [transactions, categoryFilter, from, to])

  const exportCsv = React.useCallback(() => {
    const lines = [
      ["Title", "Category", "Type", "Date", `Amount (${currencyCode})`].join(","),
      ...filtered.map((t) => {
        const cat = categories.find((c) => c.id === t.categoryId)?.name ?? "—"
        const amt = t.type === "income" ? t.amount : -t.amount
        return [t.title, cat, t.type, t.date, amt]
          .map((cell) => csvEscapeCell(cell))
          .join(",")
      }),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered, categories, currencyCode])

  const exportPdf = React.useCallback(() => {
    const esc = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
    const rowsHtml = filtered
      .map((t) => {
        const cat = categories.find((c) => c.id === t.categoryId)?.name ?? "—"
        const amt = `${t.type === "income" ? "+" : "-"}${formatMoney(t.amount, currencyCode)}`
        return `<tr><td>${esc(t.title)}</td><td>${esc(cat)}</td><td>${esc(t.type)}</td><td>${esc(t.date)}</td><td style="text-align:right">${esc(amt)}</td></tr>`
      })
      .join("")
    const w = window.open("", "_blank")
    if (!w) {
      window.alert("Pop-up blocked — allow pop-ups for this site to export PDF, or use CSV instead.")
      return
    }
    w.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Transactions</title>` +
        `<style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}h1{font-size:18px;margin:0 0 16px}` +
        `table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:8px;text-align:left}` +
        `th{background:#f4f4f5}.note{margin-top:16px;font-size:11px;color:#666}</style></head><body>` +
        `<h1>Transactions (${filtered.length})</h1><table><thead><tr>` +
        `<th>Title</th><th>Category</th><th>Type</th><th>Date</th><th style="text-align:right">Amount</th>` +
        `</tr></thead><tbody>` +
        (rowsHtml || `<tr><td colspan="5">No rows</td></tr>`) +
        `</tbody></table><p class="note">Use your browser print dialog and choose &quot;Save as PDF&quot; where available.</p>` +
        `<script>window.onload=function(){window.print()}<\/script></body></html>`
    )
    w.document.close()
  }, [filtered, categories, currencyCode])

  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-muted-foreground">
            Record spending quickly — filters apply to date and category.
          </p>
        </div>
        <Button className="bg-[#667eea] hover:bg-[#5b21b6]" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add transaction
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatMini label="Income (filtered)" value={formatMoney(income, currencyCode)} tone="emerald" />
        <StatMini label="Expenses (filtered)" value={formatMoney(expense, currencyCode)} tone="red" />
        <StatMini
          label="Net (filtered)"
          value={formatMoney(income - expense, currencyCode)}
          tone="violet"
        />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Combine date range with a category to narrow results.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 lg:w-56">
            <Label>Category</Label>
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                if (v) setCategoryFilter(v)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All categories">
                  {(value) => categoryNameById(categories, value, "All categories")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" label="All categories">
                  All categories
                </SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id} label={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full lg:w-auto"
            onClick={() => {
              setFrom("")
              setTo("")
              setCategoryFilter("all")
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">Ledger</CardTitle>
            <CardDescription>{filtered.length} row(s) match your criteria.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
              <FileDown className="size-4" />
              CSV
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportPdf}>
              <FileText className="size-4" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const cat = categories.find((c) => c.id === t.categoryId)
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>{cat?.name ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{t.date}</TableCell>
                      <TableCell
                        className={`text-right tabular-nums font-medium ${
                          t.type === "income" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatMoney(t.amount, currencyCode)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        categories={categories}
        onAdd={async (row) => {
          try {
            await addTransaction(row)
            setAddOpen(false)
          } catch (err) {
            window.alert(err instanceof Error ? err.message : "Could not save transaction.")
          }
        }}
      />
    </div>
  )
}

function StatMini({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "emerald" | "red" | "violet"
}) {
  const border =
    tone === "emerald"
      ? "border-l-emerald-500"
      : tone === "red"
        ? "border-l-red-500"
        : "border-l-violet-500"
  return (
    <Card className={`border-border/80 border-l-4 shadow-sm ${border}`}>
      <CardHeader className="py-4">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function AddTransactionDialog({
  open,
  onOpenChange,
  categories,
  onAdd,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  categories: ReturnType<typeof useBudgetApp>["categories"]
  onAdd: (t: Omit<Transaction, "id">) => void | Promise<void>
}) {
  const [title, setTitle] = React.useState("")
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id ?? "")
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = React.useState("")
  const [type, setType] = React.useState<TxType>("expense")
  const [listening, setListening] = React.useState(false)

  React.useEffect(() => {
    if (categories.length && !categories.some((c) => c.id === categoryId)) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  const startSpeech = () => {
    const w = typeof window !== "undefined" ? (window as SpeechRecognitionHost) : undefined
    const SR = w?.SpeechRecognition ?? w?.webkitSpeechRecognition
    if (!SR) {
      window.alert("Speech recognition is not supported in this browser.")
      return
    }
    const rec = new SR()
    rec.lang = "en-US"
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript?.trim()
      if (!text) return
      const lower = text.toLowerCase()
      const amtMatch =
        lower.match(/(\d+(\.\d+)?)/)?.[1] ??
        lower.match(/rm\s?(\d+(\.\d+)?)|\$\s?(\d+(\.\d+)?)/)?.[1]
      if (amtMatch) setAmount(amtMatch)
      const stripped = lower.replace(/\d+(\.\d+)?/g, "").replace(/rm|\$|dollars?|ringgit/gi, "").trim()
      if (stripped.length) setTitle((t) => (t ? `${t} ${stripped}` : stripped.slice(0, 80)))
    }
    rec.start()
  }

  const [saving, setSaving] = React.useState(false)

  const submit = async () => {
    const n = Number.parseFloat(amount.replace(/,/g, ""))
    if (!title.trim() || !categoryId || !Number.isFinite(n) || n <= 0) return
    setSaving(true)
    try {
      await onAdd({
        title: title.trim(),
        categoryId,
        date,
        amount: n,
        type,
      })
      setTitle("")
      setAmount("")
      setDate(new Date().toISOString().slice(0, 10))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New transaction</DialogTitle>
          <DialogDescription>Use voice capture for faster entry where supported.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={listening ? "default" : "outline"}
              className={listening ? "" : ""}
              onClick={() => {
                if (listening) return
                startSpeech()
              }}
              aria-pressed={listening}
              disabled={listening}
            >
              <Mic className={`size-4 ${listening ? "animate-pulse" : ""}`} />
              Speak title & amount
            </Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => {
                if (v) setCategoryId(v)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose category">
                  {(value) => categoryNameById(categories, value, "Choose category")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id} label={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="t-date">Date</Label>
            <Input id="t-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="t-amt">Amount</Label>
            <Input
              id="t-amt"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                if (v) setType(v as TxType)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#667eea] hover:bg-[#5b21b6]"
            disabled={saving}
            onClick={() => void submit()}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface SpeechRecognitionCtor {
  new (): {
    lang: string
    interimResults: boolean
    maxAlternatives: number
    start: () => void
    onstart: null | (() => void)
    onend: null | (() => void)
    onresult: null | ((ev: { results: SpeechList }) => void)
  }
}

type SpeechList = {
  readonly length: number
  [index: number]: {
    readonly length: number
    readonly [ transcriptIndex: number ]: { readonly transcript?: string }
  }
}

interface SpeechRecognitionHost extends Window {
  SpeechRecognition?: SpeechRecognitionCtor
  webkitSpeechRecognition?: SpeechRecognitionCtor
}

function csvEscapeCell(cell: string | number) {
  const s = String(cell)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}
