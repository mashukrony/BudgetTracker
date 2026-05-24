import type { AppNotification, Category, CurrencyCode, Transaction, TxType } from "@/lib/types"
import { toDateInputValue } from "@/lib/month-range"

type DbCategory = { id: string; name: string; allocatedAmt: number }
type DbTransaction = {
  id: string
  title: string
  amount: number
  type: string
  date: Date
  categoryId: string
}
type DbNotification = {
  id: string
  title: string
  message: string
  type: string
  createdAt: Date
}

export function mapCategory(c: DbCategory): Category {
  return {
    id: c.id,
    name: c.name,
    budgetAllocated: c.allocatedAmt,
  }
}

export function mapTransaction(t: DbTransaction): Transaction {
  return {
    id: t.id,
    title: t.title,
    categoryId: t.categoryId,
    date: toDateInputValue(t.date),
    amount: t.amount,
    type: t.type.toUpperCase() === "INCOME" ? "income" : "expense",
  }
}

export function txTypeToDb(type: TxType): "INCOME" | "EXPENSE" {
  return type === "income" ? "INCOME" : "EXPENSE"
}

const VALID_CURRENCIES: CurrencyCode[] = ["MYR", "USD", "EUR", "GBP", "SGD"]

export function parseCurrencyCode(value: string | null | undefined): CurrencyCode {
  const code = (value ?? "USD").toUpperCase()
  if (VALID_CURRENCIES.includes(code as CurrencyCode)) return code as CurrencyCode
  return "USD"
}

function notificationVariant(
  type: string
): AppNotification["variant"] {
  if (type === "BUDGET_EXCEEDED") return "destructive"
  if (type === "SYSTEM_ALERT") return "warning"
  if (type === "REMINDER") return "info"
  return "info"
}

function notificationKind(type: string): string {
  switch (type) {
    case "BUDGET_EXCEEDED":
      return "over_budget"
    case "SYSTEM_ALERT":
      return "category_threshold"
    case "REMINDER":
      return "insight"
    default:
      return type.toLowerCase()
  }
}

export function mapNotification(n: DbNotification): AppNotification {
  return {
    id: n.id,
    title: n.title,
    body: n.message,
    createdAt: n.createdAt.toISOString(),
    variant: notificationVariant(n.type),
    kind: notificationKind(n.type),
  }
}
