import { auth, currentUser } from "@clerk/nextjs/server"
import { isAdminRole, resolveUserRole } from "@/lib/clerk-role"

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await currentUser()
  const role = resolveUserRole(sessionClaims, user)
  if (!isAdminRole(role)) {
    throw new Error("Forbidden")
  }

  return { userId, user }
}
