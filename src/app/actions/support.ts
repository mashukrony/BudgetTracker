"use server"

import { revalidatePath } from "next/cache"
import { requireDbSession } from "@/lib/auth-session"
import { prisma } from "@/lib/prisma"

export async function createSupportTicket(input: {
  subject: string
  message: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const subject = input.subject.trim()
  const message = input.message.trim()
  if (!subject) return { ok: false, error: "Subject is required." }
  if (!message) return { ok: false, error: "Message is required." }

  const { userId } = await requireDbSession()

  await prisma.supportTicket.create({
    data: {
      userId,
      subject,
      message,
      status: "OPEN",
    },
  })

  revalidatePath("/help-support")
  revalidatePath("/admin")
  revalidatePath("/admin/qa")
  return { ok: true }
}
