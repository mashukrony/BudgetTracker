import type { User } from "@clerk/nextjs/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { INCOME_CATEGORY_NAME } from "@/lib/budget-constants"

async function ensureIncomeCategory(userId: string) {
  const incomeCategory = await prisma.category.findFirst({
    where: { userId, name: { equals: INCOME_CATEGORY_NAME, mode: "insensitive" } },
  })

  if (!incomeCategory) {
    await prisma.category.create({
      data: {
        name: INCOME_CATEGORY_NAME,
        allocatedAmt: 0,
        userId,
      },
    })
  }
}

/**
 * Clerk may issue a new user id for the same email (re-sign-up, instance reset, etc.).
 * Re-attach existing budget data to the current Clerk id so sessions stay consistent.
 */
async function relinkUserToClerkId(
  oldId: string,
  newId: string,
  email: string,
  username: string | null
) {
  const existing = await prisma.user.findUniqueOrThrow({ where: { id: oldId } })

  await prisma.$transaction(async (tx) => {
    await tx.budget.updateMany({ where: { userId: oldId }, data: { userId: newId } })
    await tx.category.updateMany({ where: { userId: oldId }, data: { userId: newId } })
    await tx.transaction.updateMany({ where: { userId: oldId }, data: { userId: newId } })
    await tx.supportTicket.updateMany({ where: { userId: oldId }, data: { userId: newId } })
    await tx.notification.updateMany({ where: { userId: oldId }, data: { userId: newId } })
    await tx.user.delete({ where: { id: oldId } })
    await tx.user.create({
      data: {
        id: newId,
        email,
        username: username ?? existing.username,
        currency: existing.currency,
      },
    })
  })
}

export async function ensureDbUser(clerkUser: User) {
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error("Signed-in user has no email address.")
  }

  const username = clerkUser.username ?? clerkUser.firstName ?? null
  const clerkId = clerkUser.id

  const byId = await prisma.user.findUnique({ where: { id: clerkId } })
  if (byId) {
    const user = await prisma.user.update({
      where: { id: clerkId },
      data: {
        email,
        ...(username ? { username } : {}),
      },
    })
    await ensureIncomeCategory(user.id)
    return user
  }

  const byEmail = await prisma.user.findUnique({ where: { email } })
  if (byEmail) {
    if (byEmail.id !== clerkId) {
      await relinkUserToClerkId(byEmail.id, clerkId, email, username)
    } else if (username) {
      await prisma.user.update({ where: { id: clerkId }, data: { username } })
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: clerkId } })
    await ensureIncomeCategory(user.id)
    return user
  }

  try {
    const user = await prisma.user.create({
      data: {
        id: clerkId,
        email,
        username,
      },
    })
    await ensureIncomeCategory(user.id)
    return user
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== clerkId) {
        await relinkUserToClerkId(existing.id, clerkId, email, username)
      }
      const user = await prisma.user.findUniqueOrThrow({ where: { id: clerkId } })
      await ensureIncomeCategory(user.id)
      return user
    }
    throw error
  }
}
