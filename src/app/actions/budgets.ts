"use server"

import { revalidatePath } from "next/cache"
import { requireDbSession } from "@/lib/auth-session"
import { prisma } from "@/lib/prisma"
import { startOfMonth } from "@/lib/month-range"

const USER_PATHS = [
  "/dashboard",
  "/budget",
  "/spend-by-categories",
  "/categories",
  "/transactions",
  "/notifications",
]

function revalidateUserApp() {
  for (const path of USER_PATHS) revalidatePath(path)
}

export async function upsertMonthlyBudget(
  amount: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isFinite(amount) || amount < 0) {
    return { ok: false, error: "Enter a valid budget amount." }
  }

  const { userId } = await requireDbSession()
  const month = startOfMonth()

  const existing = await prisma.budget.findFirst({
    where: { userId, month },
  })

  if (existing) {
    await prisma.budget.update({
      where: { id: existing.id },
      data: { amount },
    })
  } else {
    await prisma.budget.create({
      data: { userId, month, amount },
    })
  }

  revalidateUserApp()
  return { ok: true }
}
