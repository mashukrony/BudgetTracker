import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AdminAppShell } from "@/components/layout/admin-app-shell"
import { AdminAppProvider } from "@/contexts/admin-app-context"
import { isAdminRole, resolveUserRole } from "@/lib/clerk-role"
import { getAdminSnapshot } from "@/lib/queries/admin-snapshot"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const role = resolveUserRole(sessionClaims, user)
  if (!isAdminRole(role)) redirect("/dashboard")

  const snapshot = await getAdminSnapshot()

  return (
    <AdminAppShell>
      <AdminAppProvider initial={snapshot}>{children}</AdminAppProvider>
    </AdminAppShell>
  )
}
