"use client"

import * as React from "react"
import { Mail, Pencil, Trash2, UserPlus } from "lucide-react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import type { DemoUser } from "@/lib/types"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminUsersPage() {
  const { adminDemoUsers, setAdminDemoUsers } = useBudgetApp()
  const [dialog, setDialog] = React.useState<
    null | { mode: "create" } | { mode: "edit"; user: DemoUser }
  >(null)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<DemoUser["status"]>("Active")

  const openCreate = () => {
    setName("")
    setEmail("")
    setStatus("Active")
    setDialog({ mode: "create" })
  }

  const openEdit = (user: DemoUser) => {
    setName(user.name)
    setEmail(user.email)
    setStatus(user.status)
    setDialog({ mode: "edit", user })
  }

  const save = () => {
    if (!name.trim() || !email.includes("@")) return
    if (dialog?.mode === "create") {
      setAdminDemoUsers((prev) => [
        {
          id: `u-${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          joinDate: new Date().toISOString().slice(0, 10),
          status,
          lastActive: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ])
    } else if (dialog?.mode === "edit") {
      setAdminDemoUsers((prev) =>
        prev.map((u) =>
          u.id === dialog.user.id
            ? { ...u, name: name.trim(), email: email.trim(), status }
            : u
        )
      )
    }
    setDialog(null)
  }

  const suspend = (user: DemoUser) => {
    setAdminDemoUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              status: u.status === "Suspended" ? ("Active" as const) : ("Suspended" as const),
            }
          : u
      )
    )
  }

  const remove = (id: string) => {
    setAdminDemoUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage user accounts</h1>
          <p className="mt-1 text-muted-foreground">
            Create, suspend, or remove mock accounts — persists for the session only.
          </p>
        </div>
        <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={openCreate}>
          <UserPlus className="size-4" />
          New user
        </Button>
      </header>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Directory</CardTitle>
          <CardDescription>Name, email, status, join date, and last recorded activity.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden lg:table-cell">ID</TableHead>
                  <TableHead className="hidden md:table-cell">Join date</TableHead>
                  <TableHead className="hidden sm:table-cell">Last activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminDemoUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.name}</div>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs text-[#2563eb] hover:underline"
                        onClick={() => (window.location.href = `mailto:${u.email}`)}
                      >
                        <Mail className="size-3.5" aria-hidden />
                        {u.email}
                      </button>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs lg:table-cell">{u.id}</TableCell>
                    <TableCell className="hidden md:table-cell">{u.joinDate}</TableCell>
                    <TableCell className="hidden sm:table-cell">{u.lastActive}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === "Active" ? "secondary" : "destructive"}>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => openEdit(u)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => suspend(u)}>
                          {u.status === "Suspended" ? "Activate" : "Suspend"}
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => remove(u.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "edit" ? "Edit account" : "Create account"}</DialogTitle>
            <DialogDescription>Session-only until your directory service is wired in.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="adm-name">Full name</Label>
              <Input id="adm-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adm-email">Email</Label>
              <Input id="adm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  if (v) setStatus(v as DemoUser["status"])
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
