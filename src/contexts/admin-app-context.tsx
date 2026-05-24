"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { deleteSupportTicket } from "@/app/actions/admin-support"
import type { AdminSnapshot, AdminSupportTicket } from "@/lib/queries/admin-snapshot"

type AdminAppContextValue = AdminSnapshot & {
  deleteSupportMessage: (id: string) => Promise<void>
}

const AdminAppContext = React.createContext<AdminAppContextValue | null>(null)

export function AdminAppProvider({
  children,
  initial,
}: {
  children: React.ReactNode
  initial: AdminSnapshot
}) {
  const router = useRouter()
  const [snapshot, setSnapshot] = React.useState(initial)

  React.useEffect(() => {
    setSnapshot(initial)
  }, [initial])

  const deleteSupportMessage = React.useCallback(
    async (id: string) => {
      const result = await deleteSupportTicket(id)
      if (!result.ok) throw new Error(result.error ?? "Could not delete ticket.")
      router.refresh()
    },
    [router]
  )

  const value = React.useMemo<AdminAppContextValue>(
    () => ({
      ...snapshot,
      deleteSupportMessage,
    }),
    [snapshot, deleteSupportMessage]
  )

  return <AdminAppContext.Provider value={value}>{children}</AdminAppContext.Provider>
}

export function useAdminApp() {
  const ctx = React.useContext(AdminAppContext)
  if (!ctx) throw new Error("useAdminApp must be used within AdminAppProvider")
  return ctx
}

export type { AdminSupportTicket }
