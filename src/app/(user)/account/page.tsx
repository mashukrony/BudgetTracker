"use client"

import * as React from "react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import type { CurrencyCode } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const CUR: CurrencyCode[] = ["MYR", "USD", "EUR", "GBP", "SGD"]

export default function AccountPage() {
  const {
    logout,
    userDisplayName,
    userEmail,
    userPhone,
    setUserDisplayName,
    setUserEmail,
    setUserPhone,
    currencyCode,
    setCurrencyCode,
  } = useBudgetApp()

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const savePassword = () => {
    if (password !== confirmPassword || password.length < 4) return
    setPassword("")
    setConfirmPassword("")
    window.alert("Password updated locally — connect auth to persist.")
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-muted-foreground">
          Profile edits and currency preference ripple through every monetized widget in this client demo.
        </p>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>Visible to admins only when synced with IAM.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="a-name">Name</Label>
            <Input
              id="a-name"
              value={userDisplayName}
              onChange={(e) => setUserDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-email">Email</Label>
            <Input
              id="a-email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-phone">Phone</Label>
            <Input id="a-phone" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Preferred currency</Label>
            <Select
              value={currencyCode}
              onValueChange={(v) => {
                if (v) setCurrencyCode(v as CurrencyCode)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUR.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="a-pw">New password</Label>
            <Input
              id="a-pw"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-pw2">Confirm password</Label>
            <Input
              id="a-pw2"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button className="bg-[#667eea] hover:bg-[#5b21b6]" type="button" onClick={savePassword}>
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
