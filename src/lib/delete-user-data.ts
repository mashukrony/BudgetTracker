import { prisma } from "@/lib/prisma"

/**
 * Delete a user row and all related budget data from PostgreSQL.
 * Child rows cascade via schema relations; also clears legacy rows matched by email.
 */
export async function deleteUserFromDatabase(
  userId: string,
  email?: string | null
): Promise<void> {
  await prisma.user.deleteMany({ where: { id: userId } })
  const normalizedEmail = email?.trim()
  if (normalizedEmail) {
    await prisma.user.deleteMany({ where: { email: normalizedEmail } })
  }
}
