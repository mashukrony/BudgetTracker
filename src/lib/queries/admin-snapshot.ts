import { prisma } from "@/lib/prisma"

export type AdminSupportTicket = {
  id: string
  username: string
  email: string
  subject: string
  message: string
  submittedAt: string
  status: string
}

export type AdminSnapshot = {
  totalUsers: number
  openTickets: number
  supportMessages: AdminSupportTicket[]
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const [totalUsers, openTickets, tickets] = await Promise.all([
    prisma.user.count(),
    prisma.supportTicket.count({
      where: { status: { in: ["OPEN", "open"] } },
    }),
    prisma.supportTicket.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ])

  return {
    totalUsers,
    openTickets,
    supportMessages: tickets.map((t) => ({
      id: t.id,
      username: t.user.username ?? t.user.email.split("@")[0] ?? "User",
      email: t.user.email,
      subject: t.subject,
      message: t.message,
      submittedAt: t.createdAt.toISOString(),
      status: t.status,
    })),
  }
}
