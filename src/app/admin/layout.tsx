import { AdminAppShell } from "@/components/layout/admin-app-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAppShell>{children}</AdminAppShell>
}
