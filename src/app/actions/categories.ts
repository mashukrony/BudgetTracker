"use server"

import { revalidatePath } from "next/cache"
import { requireDbSession } from "@/lib/auth-session"
import { isIncomeCategoryName } from "@/lib/budget-constants"
import { prisma } from "@/lib/prisma"

const USER_PATHS = [
  "/dashboard",
  "/budget",
  "/spend-by-categories",
  "/categories",
  "/transactions",
]

function revalidateUserApp() {
  revalidatePath("/dashboard", "layout")
  for (const path of USER_PATHS) revalidatePath(path)
}

export async function createCategory(
  name: string,
  budgetAllocated: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: "Category name is required." }
  if (isIncomeCategoryName(trimmed)) {
    return { ok: false, error: `"${trimmed}" is reserved for income tracking.` }
  }
  if (!Number.isFinite(budgetAllocated) || budgetAllocated < 0) {
    return { ok: false, error: "Enter a valid budget amount." }
  }

  const { userId } = await requireDbSession()

  await prisma.category.create({
    data: {
      name: trimmed,
      allocatedAmt: budgetAllocated,
      userId,
    },
  })

  revalidateUserApp()
  return { ok: true }
}

export async function updateCategory(
  id: string,
  name: string,
  budgetAllocated: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: "Category name is required." }
  if (!Number.isFinite(budgetAllocated) || budgetAllocated < 0) {
    return { ok: false, error: "Enter a valid budget amount." }
  }

  const { userId } = await requireDbSession()

  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) return { ok: false, error: "Category not found." }
  if (isIncomeCategoryName(existing.name)) {
    return { ok: false, error: "The Income category cannot be edited." }
  }
  if (isIncomeCategoryName(trimmed)) {
    return { ok: false, error: `"${trimmed}" is reserved for income tracking.` }
  }

  await prisma.category.update({
    where: { id },
    data: { name: trimmed, allocatedAmt: budgetAllocated },
  })

  revalidateUserApp()
  return { ok: true }
}

export async function deleteCategory(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await requireDbSession()

  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) return { ok: false, error: "Category not found." }
  if (isIncomeCategoryName(existing.name)) {
    return { ok: false, error: "The Income category cannot be deleted." }
  }

  await prisma.category.delete({ where: { id } })

  revalidateUserApp()
  return { ok: true }
}
