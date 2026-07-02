"use client"

import * as React from "react"
import { Ban, Lock, Trash2, Unlock, UserPlus } from "lucide-react"
import type { AdminUserRow } from "@/lib/admin-users"
import { formatAdminUserDate } from "@/lib/admin-users"
import {
  createClerkUser,
  deleteClerkUser,
  setClerkUserBanned,
  setClerkUserLocked,
} from "@/app/admin/users/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Props = {
  initialUsers: AdminUserRow[]
}

export function AdminUsersPanel({ initialUsers }: Props) {
  const [users, setUsers] = React.useState(initialUsers)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [pending, setPending] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")

  React.useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  const runAction = async (key: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setPending(key)
    setError(null)
    const result = await fn()
    setPending(null)
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.")
      return
    }
    window.location.reload()
  }

  const onCreate = async () => {
    setPending("create")
    setError(null)
    const result = await createClerkUser({
      emailAddress: email,
      password,
      username: username || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    })
    setPending(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setCreateOpen(false)
    setEmail("")
    setPassword("")
    setUsername("")
    setFirstName("")
    setLastName("")
    window.location.reload()
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage user accounts</h1>
          <p className="mt-1 text-muted-foreground">
            Live directory from your Clerk instance — create, lock, ban, or delete accounts.
          </p>
        </div>
        <Button
          className="bg-[#2563eb] hover:bg-[#1d4ed8]"
          onClick={() => {
            setError(null)
            setCreateOpen(true)
          }}
        >
          <UserPlus className="size-4" />
          Create user
        </Button>
      </header>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>
            Username, email, join date, and last sign-in synced from Clerk.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="hidden sm:table-cell">Last signed in</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No users found in Clerk yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username ?? "—"}</TableCell>
                      <TableCell>{user.email ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatAdminUserDate(user.joinedAt)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatAdminUserDate(user.lastSignInAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.banned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : user.locked ? (
                            <Badge variant="secondary">Locked</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending !== null}
                            onClick={() =>
                              runAction(`lock-${user.id}`, () =>
                                setClerkUserLocked(user.id, !user.locked)
                              )
                            }
                          >
                            {user.locked ? (
                              <Unlock className="size-4" />
                            ) : (
                              <Lock className="size-4" />
                            )}
                            {user.locked ? "Unlock" : "Lock"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending !== null}
                            onClick={() =>
                              runAction(`ban-${user.id}`, () =>
                                setClerkUserBanned(user.id, !user.banned)
                              )
                            }
                          >
                            <Ban className="size-4" />
                            {user.banned ? "Unban" : "Ban"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={pending !== null}
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `Delete ${user.email ?? user.username ?? "this user"}? Their Clerk account and all budget data in the database will be permanently removed.`
                                )
                              ) {
                                return
                              }
                              void runAction(`delete-${user.id}`, () => deleteClerkUser(user.id))
                            }}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              Creates a verified user in Clerk (same as the Clerk dashboard create flow).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="clerk-email">Email</Label>
              <Input
                id="clerk-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clerk-password">Password</Label>
              <Input
                id="clerk-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clerk-username">Username (optional)</Label>
              <Input
                id="clerk-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clerk-first">First name (optional)</Label>
                <Input
                  id="clerk-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clerk-last">Last name (optional)</Label>
                <Input
                  id="clerk-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={pending === "create"}>
              Cancel
            </Button>
            <Button
              className="bg-[#2563eb] hover:bg-[#1d4ed8]"
              onClick={() => void onCreate()}
              disabled={pending === "create"}
            >
              Create user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
