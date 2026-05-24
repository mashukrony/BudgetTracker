import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserAppShell } from "@/components/layout/user-app-shell"
import { isAdminRole, resolveUserRole } from "@/lib/clerk-role"

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const role = resolveUserRole(sessionClaims, user)
  if (isAdminRole(role)) redirect("/admin")

  return <UserAppShell>{children}</UserAppShell>
}
