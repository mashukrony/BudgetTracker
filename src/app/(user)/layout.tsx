import { UserAppShell } from "@/components/layout/user-app-shell"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserAppShell>{children}</UserAppShell>
}
