import { AdminUsersPanel } from "@/app/admin/users/admin-users-panel"
import { listClerkUsers } from "@/app/admin/users/actions"

export default async function AdminUsersPage() {
  const users = await listClerkUsers()
  return <AdminUsersPanel initialUsers={users} />
}
