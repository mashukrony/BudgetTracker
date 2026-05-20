"use client"

import { Mail, Trash2 } from "lucide-react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminQaPage() {
  const { supportMessages, deleteSupportMessage } = useBudgetApp()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Q&A messages</h1>
        <p className="mt-1 text-muted-foreground">
          Usernames with their corresponding email are shown for quicker manual replies outside the app.
        </p>
      </header>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Inbox</CardTitle>
          <CardDescription>Delete removes the row from admin view only in this demo layer.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Subject</TableHead>
                  <TableHead className="hidden xl:table-cell">Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No messages yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  supportMessages.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="align-top">
                        <div className="font-medium">{m.username}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{m.email}</div>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground lg:hidden">{m.message}</p>
                      </TableCell>
                      <TableCell className="hidden align-top md:table-cell">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[#2563eb] hover:underline"
                          onClick={() => (window.location.href = `mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject)}`)}
                        >
                          <Mail className="size-3.5 shrink-0" />
                          {m.email}
                        </button>
                      </TableCell>
                      <TableCell className="hidden align-top lg:table-cell">
                        <div className="max-w-[220px] truncate font-medium">{m.subject}</div>
                        <p className="mt-1 max-w-md text-sm text-muted-foreground">{m.message}</p>
                      </TableCell>
                      <TableCell className="hidden align-top text-sm text-muted-foreground xl:table-cell">
                        {new Date(m.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              (window.location.href = `mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject)}`)
                            }
                          >
                            Email
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteSupportMessage(m.id)}
                          >
                            <Trash2 className="size-4" />
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
    </div>
  )
}
