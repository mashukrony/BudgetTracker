import { prisma } from "@/lib/prisma"
import { isIncomeCategoryName } from "@/lib/budget-constants"
import {
  mapCategory,
  mapNotification,
  mapTransaction,
  parseCurrencyCode,
} from "@/lib/mappers"
import { endOfMonth, previousMonthStart, startOfMonth } from "@/lib/month-range"
import { spendByCategory, sumExpenses, sumIncome } from "@/lib/spend-utils"
import type { AppNotification, Category, CurrencyCode, Transaction } from "@/lib/types"

export type PeriodComparison = {
  budget: number
  spent: number
  remaining: number
  topCategoryName: string
}

export type UserBudgetSnapshot = {
  userDisplayName: string
  userEmail: string
  currencyCode: CurrencyCode
  monthlyBudget: number
  monthlyIncome: number
  categories: Category[]
  transactions: Transaction[]
  notifications: AppNotification[]
  spendMap: Record<string, number>
  totalExpenseThisMonth: number
  overallRemaining: number
  periodComparison: {
    previous: PeriodComparison
    current: PeriodComparison
  }
  incomeDeltaPct: number | null
  expenseDeltaPct: number | null
}

async function loadPeriodMetrics(
  userId: string,
  monthStart: Date,
  monthEnd: Date,
  monthlyBudgetAmount: number
): Promise<PeriodComparison> {
  const [categories, transactions] = await Promise.all([
    prisma.category.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
    }),
  ])

  const mappedCategories = categories.map(mapCategory)
  const mappedTransactions = transactions.map(mapTransaction)
  const spendMap = spendByCategory(
    mappedTransactions,
    mappedCategories,
    monthStart,
    monthEnd
  )
  const spent = sumExpenses(spendMap)

  let topCategoryName = "—"
  let topSpent = 0
  for (const c of mappedCategories) {
    if (isIncomeCategoryName(c.name)) continue
    const s = spendMap[c.id] ?? 0
    if (s > topSpent) {
      topSpent = s
      topCategoryName = c.name
    }
  }

  return {
    budget: monthlyBudgetAmount,
    spent,
    remaining: Math.max(0, monthlyBudgetAmount - spent),
    topCategoryName,
  }
}

function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? null : 100
  return Math.round(((current - previous) / previous) * 10) / 10
}

export async function getUserBudgetSnapshot(userId: string): Promise<UserBudgetSnapshot> {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const prevMonthStart = previousMonthStart(now)
  const prevMonthEnd = endOfMonth(prevMonthStart)

  const [dbUser, categories, transactions, notifications, currentBudget, prevBudget, latestBudget] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: [{ date: "desc" }, { id: "desc" }],
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.budget.findFirst({
        where: { userId, month: monthStart },
      }),
      prisma.budget.findFirst({
        where: { userId, month: prevMonthStart },
      }),
      prisma.budget.findFirst({
        where: { userId },
        orderBy: { month: "desc" },
      }),
    ])

  const mappedCategories = categories.map(mapCategory)
  const mappedTransactions = transactions.map(mapTransaction)
  const monthlyBudget = currentBudget?.amount ?? latestBudget?.amount ?? 0
  const prevMonthlyBudget = prevBudget?.amount ?? 0

  const spendMap = spendByCategory(
    mappedTransactions,
    mappedCategories,
    monthStart,
    monthEnd
  )
  const totalExpenseThisMonth = sumExpenses(spendMap)
  const monthlyIncome = sumIncome(mappedTransactions, monthStart, monthEnd)
  const prevMonthIncome = sumIncome(mappedTransactions, prevMonthStart, prevMonthEnd)
  const prevMonthSpendMap = spendByCategory(
    mappedTransactions,
    mappedCategories,
    prevMonthStart,
    prevMonthEnd
  )
  const prevMonthExpense = sumExpenses(prevMonthSpendMap)

  const [currentPeriod, previousPeriod] = await Promise.all([
    loadPeriodMetrics(userId, monthStart, monthEnd, monthlyBudget),
    loadPeriodMetrics(userId, prevMonthStart, prevMonthEnd, prevMonthlyBudget),
  ])

  const displayName =
    dbUser.username ??
    dbUser.email.split("@")[0] ??
    "User"

  return {
    userDisplayName: displayName,
    userEmail: dbUser.email,
    currencyCode: parseCurrencyCode(dbUser.currency),
    monthlyBudget,
    monthlyIncome,
    categories: mappedCategories,
    transactions: mappedTransactions,
    notifications: notifications.map(mapNotification),
    spendMap,
    totalExpenseThisMonth,
    overallRemaining: Math.max(0, monthlyBudget - totalExpenseThisMonth),
    periodComparison: {
      current: currentPeriod,
      previous: previousPeriod,
    },
    incomeDeltaPct: percentDelta(monthlyIncome, prevMonthIncome),
    expenseDeltaPct: percentDelta(totalExpenseThisMonth, prevMonthExpense),
  }
}
