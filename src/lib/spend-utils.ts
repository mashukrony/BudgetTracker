import { isIncomeCategoryName } from "@/lib/budget-constants"
import { isDateInRange } from "@/lib/month-range"
import type { Category, Transaction } from "@/lib/types"

export function spendByCategory(
  transactions: Transaction[],
  categories: Category[],
  monthStart?: Date,
  monthEnd?: Date
): Record<string, number> {
  const incomeIds = new Set(
    categories.filter((c) => isIncomeCategoryName(c.name)).map((c) => c.id)
  )
  const map: Record<string, number> = {}
  for (const t of transactions) {
    if (t.type !== "expense" || incomeIds.has(t.categoryId)) continue
    if (monthStart && monthEnd && !isDateInRange(t.date, monthStart, monthEnd)) continue
    map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount
  }
  return map
}

export function sumExpenses(spendMap: Record<string, number>): number {
  return Object.values(spendMap).reduce((a, b) => a + b, 0)
}

export function sumIncome(
  transactions: Transaction[],
  monthStart?: Date,
  monthEnd?: Date
): number {
  return transactions
    .filter((t) => {
      if (t.type !== "income") return false
      if (monthStart && monthEnd && !isDateInRange(t.date, monthStart, monthEnd)) return false
      return true
    })
    .reduce((s, t) => s + t.amount, 0)
}
