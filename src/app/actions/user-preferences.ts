"use server"

import { revalidatePath } from "next/cache"
import { requireDbSession } from "@/lib/auth-session"
import { parseCurrencyCode } from "@/lib/mappers"
import { prisma } from "@/lib/prisma"
import type { CurrencyCode } from "@/lib/types"

const USER_PATHS = [
  "/dashboard",
  "/budget",
  "/account",
  "/spend-by-categories",
  "/categories",
  "/transactions",
]

function revalidateUserApp() {
  for (const path of USER_PATHS) revalidatePath(path)
}

export async function updateCurrency(
  currency: CurrencyCode
): Promise<{ ok: true } | { ok: false; error: string }> {
  const code = parseCurrencyCode(currency)
  const { userId } = await requireDbSession()

  await prisma.user.update({
    where: { id: userId },
    data: { currency: code },
  })

  revalidateUserApp()
  return { ok: true }
}
