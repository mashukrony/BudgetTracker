import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserAppShell } from "@/components/layout/user-app-shell"
import { BudgetAppProvider } from "@/contexts/budget-app-context"
import { ensureDbUser } from "@/lib/ensure-user"
import { isAdminRole, resolveUserRole } from "@/lib/clerk-role"
import { getUserBudgetSnapshot } from "@/lib/queries/user-snapshot"

export const dynamic = "force-dynamic"

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const role = resolveUserRole(sessionClaims, user)
  if (isAdminRole(role)) redirect("/admin")

  if (user) await ensureDbUser(user)

  const snapshot = await getUserBudgetSnapshot(userId)

  return (
    <UserAppShell>
      <BudgetAppProvider initial={snapshot}>{children}</BudgetAppProvider>
    </UserAppShell>
  )
}
