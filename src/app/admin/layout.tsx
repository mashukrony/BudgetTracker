import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AdminAppShell } from "@/components/layout/admin-app-shell"
import { isAdminRole, resolveUserRole } from "@/lib/clerk-role"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const role = resolveUserRole(sessionClaims, user)
  if (!isAdminRole(role)) redirect("/dashboard")

  return <AdminAppShell>{children}</AdminAppShell>
}
