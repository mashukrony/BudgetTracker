import { isIncomeCategoryName } from "@/lib/budget-constants"
import { endOfMonth, previousMonthStart, startOfMonth } from "@/lib/month-range"
import { spendByCategory, sumExpenses, sumIncome } from "@/lib/spend-utils"
import type { UserBudgetSnapshot } from "@/lib/queries/user-snapshot"
import type { Category, Transaction } from "@/lib/types"

function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? null : 100
  return Math.round(((current - previous) / previous) * 10) / 10
}

function topCategoryName(categories: Category[], spendMap: Record<string, number>): string {
  let name = "—"
  let topSpent = 0
  for (const c of categories) {
    if (isIncomeCategoryName(c.name)) continue
    const s = spendMap[c.id] ?? 0
    if (s > topSpent) {
      topSpent = s
      name = c.name
    }
  }
  return name
}

export function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return a.id < b.id ? 1 : -1
  })
}

export function deriveTransactionMetrics(
  categories: Category[],
  transactions: Transaction[],
  monthlyBudget: number,
  prevMonthlyBudget: number
) {
  const monthStart = startOfMonth()
  const monthEnd = endOfMonth()
  const prevMonthStart = previousMonthStart()
  const prevMonthEnd = endOfMonth(prevMonthStart)

  const spendMap = spendByCategory(transactions, categories, monthStart, monthEnd)
  const totalExpenseThisMonth = sumExpenses(spendMap)
  const monthlyIncome = sumIncome(transactions, monthStart, monthEnd)
  const prevMonthIncome = sumIncome(transactions, prevMonthStart, prevMonthEnd)
  const prevMonthSpendMap = spendByCategory(
    transactions,
    categories,
    prevMonthStart,
    prevMonthEnd
  )
  const prevMonthExpense = sumExpenses(prevMonthSpendMap)

  return {
    spendMap,
    totalExpenseThisMonth,
    monthlyIncome,
    overallRemaining: Math.max(0, monthlyBudget - totalExpenseThisMonth),
    incomeDeltaPct: percentDelta(monthlyIncome, prevMonthIncome),
    expenseDeltaPct: percentDelta(totalExpenseThisMonth, prevMonthExpense),
    periodComparison: {
      current: {
        budget: monthlyBudget,
        spent: totalExpenseThisMonth,
        remaining: Math.max(0, monthlyBudget - totalExpenseThisMonth),
        topCategoryName: topCategoryName(categories, spendMap),
      },
      previous: {
        budget: prevMonthlyBudget,
        spent: prevMonthExpense,
        remaining: Math.max(0, prevMonthlyBudget - prevMonthExpense),
        topCategoryName: topCategoryName(categories, prevMonthSpendMap),
      },
    },
  }
}

export function withTransactions(
  snapshot: UserBudgetSnapshot,
  transactions: Transaction[]
): UserBudgetSnapshot {
  const sorted = sortTransactions(transactions)
  const prevMonthlyBudget = snapshot.periodComparison.previous.budget
  return {
    ...snapshot,
    transactions: sorted,
    ...deriveTransactionMetrics(
      snapshot.categories,
      sorted,
      snapshot.monthlyBudget,
      prevMonthlyBudget
    ),
  }
}
