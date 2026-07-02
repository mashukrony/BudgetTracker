"use server"

import { revalidatePath } from "next/cache"
import { requireDbSession } from "@/lib/auth-session"
import { INCOME_CATEGORY_NAME, isIncomeCategoryName } from "@/lib/budget-constants"
import { prisma } from "@/lib/prisma"
import { mapCategory, mapTransaction, txTypeToDb } from "@/lib/mappers"
import { endOfMonth, parseDateInput, startOfMonth } from "@/lib/month-range"
import { spendByCategory } from "@/lib/spend-utils"
import type { TxType } from "@/lib/types"

const USER_PATHS = [
  "/dashboard",
  "/budget",
  "/spend-by-categories",
  "/categories",
  "/transactions",
  "/notifications",
]

function revalidateUserApp() {
  revalidatePath("/dashboard", "layout")
  for (const path of USER_PATHS) revalidatePath(path)
}

async function maybeCreateBudgetAlert(userId: string, categoryId: string) {
  const monthStart = startOfMonth()
  const monthEnd = endOfMonth()

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  })
  if (!category || category.allocatedAmt <= 0) return

  const [categories, transactions] = await Promise.all([
    prisma.category.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd }, type: "EXPENSE" },
    }),
  ])

  const mappedCategories = categories.map(mapCategory)
  const mappedTransactions = transactions.map(mapTransaction)
  const spendMap = spendByCategory(mappedTransactions, mappedCategories, monthStart, monthEnd)
  const spent = spendMap[categoryId] ?? 0

  if (spent < category.allocatedAmt) return

  const type = spent > category.allocatedAmt ? "BUDGET_EXCEEDED" : "SYSTEM_ALERT"
  const title = `${category.name} budget`
  const message =
    spent > category.allocatedAmt
      ? `Spending exceeded the budget for ${category.name}.`
      : `You reached the planned budget cap for ${category.name}.`

  const recent = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      title,
      createdAt: { gte: monthStart },
    },
    orderBy: { createdAt: "desc" },
  })

  if (recent) return

  await prisma.notification.create({
    data: { userId, title, message, type },
  })
}

async function resolveTransactionCategory(
  userId: string,
  type: TxType,
  categoryId: string | undefined
): Promise<{ ok: true; categoryId: string } | { ok: false; error: string }> {
  let resolvedCategoryId = categoryId?.trim() ?? ""

  if (type === "income") {
    if (resolvedCategoryId) {
      const category = await prisma.category.findFirst({
        where: { id: resolvedCategoryId, userId },
      })
      if (!category) return { ok: false, error: "Category not found." }
      if (!isIncomeCategoryName(category.name)) {
        return { ok: false, error: "Income must use the Income category." }
      }
    } else {
      const incomeCategory = await prisma.category.findFirst({
        where: { userId, name: { equals: INCOME_CATEGORY_NAME, mode: "insensitive" } },
      })
      if (!incomeCategory) {
        return { ok: false, error: "Income category not found. Sign out and back in to restore it." }
      }
      resolvedCategoryId = incomeCategory.id
    }
  } else {
    if (!resolvedCategoryId) return { ok: false, error: "Category is required for expenses." }
    const category = await prisma.category.findFirst({
      where: { id: resolvedCategoryId, userId },
    })
    if (!category) return { ok: false, error: "Category not found." }
    if (isIncomeCategoryName(category.name)) {
      return { ok: false, error: "Choose an expense category, not Income." }
    }
  }

  return { ok: true, categoryId: resolvedCategoryId }
}

export async function createTransaction(input: {
  title: string
  categoryId?: string
  date: string
  amount: number
  type: TxType
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const title = input.title.trim()
  if (!title) return { ok: false, error: "Title is required." }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid amount." }
  }

  const parsedDate = parseDateInput(input.date)
  if (Number.isNaN(parsedDate.getTime())) {
    return { ok: false, error: "Enter a valid date." }
  }

  const { userId } = await requireDbSession()

  const categoryResult = await resolveTransactionCategory(userId, input.type, input.categoryId)
  if (!categoryResult.ok) return categoryResult
  const categoryId = categoryResult.categoryId

  await prisma.transaction.create({
    data: {
      title,
      categoryId,
      date: parsedDate,
      amount: input.amount,
      type: txTypeToDb(input.type),
      userId,
    },
  })

  if (input.type === "expense") {
    await maybeCreateBudgetAlert(userId, categoryId)
  }

  revalidateUserApp()
  return { ok: true }
}

export async function deleteTransaction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await requireDbSession()

  const existing = await prisma.transaction.findFirst({ where: { id, userId } })
  if (!existing) return { ok: false, error: "Transaction not found." }

  await prisma.transaction.delete({ where: { id } })

  revalidateUserApp()
  return { ok: true }
}

export async function updateTransaction(
  id: string,
  input: {
    title: string
    categoryId?: string
    date: string
    amount: number
    type: TxType
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const title = input.title.trim()
  if (!title) return { ok: false, error: "Title is required." }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid amount." }
  }

  const parsedDate = parseDateInput(input.date)
  if (Number.isNaN(parsedDate.getTime())) {
    return { ok: false, error: "Enter a valid date." }
  }

  const { userId } = await requireDbSession()

  const existing = await prisma.transaction.findFirst({ where: { id, userId } })
  if (!existing) return { ok: false, error: "Transaction not found." }

  const categoryResult = await resolveTransactionCategory(userId, input.type, input.categoryId)
  if (!categoryResult.ok) return categoryResult

  await prisma.transaction.update({
    where: { id },
    data: {
      title,
      categoryId: categoryResult.categoryId,
      date: parsedDate,
      amount: input.amount,
      type: txTypeToDb(input.type),
    },
  })

  if (input.type === "expense") {
    await maybeCreateBudgetAlert(userId, categoryResult.categoryId)
  }

  revalidateUserApp()
  return { ok: true }
}
