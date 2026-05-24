"use server"

import { revalidatePath } from "next/cache"
import { requireDbSession } from "@/lib/auth-session"
import { prisma } from "@/lib/prisma"

export async function deleteNotification(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await requireDbSession()

  const existing = await prisma.notification.findFirst({ where: { id, userId } })
  if (!existing) return { ok: false, error: "Notification not found." }

  await prisma.notification.delete({ where: { id } })

  revalidatePath("/notifications")
  return { ok: true }
}
