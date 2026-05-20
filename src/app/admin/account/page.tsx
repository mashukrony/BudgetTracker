"use client"

import * as React from "react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function AdminAccountPage() {
  const {
    logout,
    adminDisplayName,
    adminEmail,
    adminPhone,
    setAdminDisplayName,
    setAdminEmail,
    setAdminPhone,
  } = useBudgetApp()

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const savePassword = () => {
    if (password !== confirmPassword || password.length < 4) return
    setPassword("")
    setConfirmPassword("")
    window.alert("Updated locally — no currency controls for admins in this scaffold.")
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Admin account</h1>
        <p className="mt-1 text-muted-foreground">
          Profile edits without consumer currency tooling — aligns with separation of privileges.
        </p>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>Operational identity scoped to administrators.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="ad-name">Name</Label>
            <Input id="ad-name" value={adminDisplayName} onChange={(e) => setAdminDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-email">Email</Label>
            <Input id="ad-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-phone">Phone</Label>
            <Input id="ad-phone" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="ad-pw">New password</Label>
            <Input id="ad-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-pw2">Confirm password</Label>
            <Input
              id="ad-pw2"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]" type="button" onClick={savePassword}>
              Update password
            </Button>
            <Button variant="outline" type="button" onClick={() => logout()}>
              Sign out locally
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
