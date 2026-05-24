import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { isAdminRole, resolveUserRole } from "@/lib/clerk-role"

/** Server redirect after sign-in / sign-up — no client flash or loading spinner. */
export default async function PostSignInPage() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const role = resolveUserRole(sessionClaims, user)

  if (isAdminRole(role)) redirect("/admin")
  redirect("/dashboard")
}
