import type { User } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { INCOME_CATEGORY_NAME } from "@/lib/budget-constants"

export async function ensureDbUser(clerkUser: User) {
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error("Signed-in user has no email address.")
  }

  const username = clerkUser.username ?? clerkUser.firstName ?? null

  const user = await prisma.user.upsert({
    where: { id: clerkUser.id },
    create: {
      id: clerkUser.id,
      email,
      username,
    },
    update: {
      email,
      ...(username ? { username } : {}),
    },
  })

  const incomeCategory = await prisma.category.findFirst({
    where: { userId: user.id, name: { equals: INCOME_CATEGORY_NAME, mode: "insensitive" } },
  })

  if (!incomeCategory) {
    await prisma.category.create({
      data: {
        name: INCOME_CATEGORY_NAME,
        allocatedAmt: 0,
        userId: user.id,
      },
    })
  }

  return user
}
