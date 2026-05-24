import { isIncomeCategoryName } from "@/lib/budget-constants"
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
    const d = new Date(t.date)
    if (monthStart && d < monthStart) continue
    if (monthEnd && d > monthEnd) continue
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
      const d = new Date(t.date)
      if (monthStart && d < monthStart) return false
      if (monthEnd && d > monthEnd) return false
      return true
    })
    .reduce((s, t) => s + t.amount, 0)
}
