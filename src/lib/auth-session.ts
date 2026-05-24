import { auth, currentUser } from "@clerk/nextjs/server"
import { ensureDbUser } from "@/lib/ensure-user"

export async function requireAuthUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  return userId
}

export async function requireDbSession() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error("Unauthorized")

  const user = await ensureDbUser(clerkUser)
  return { userId, clerkUser, user }
}
