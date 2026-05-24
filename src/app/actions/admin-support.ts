"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"

export async function deleteSupportTicket(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: "Admin access required." }
  }

  await prisma.supportTicket.delete({ where: { id } }).catch(() => null)

  revalidatePath("/admin")
  revalidatePath("/admin/qa")
  return { ok: true }
}
