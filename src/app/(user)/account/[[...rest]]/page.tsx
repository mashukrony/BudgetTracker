"use client"

import * as React from "react"
import { UserProfile } from "@clerk/nextjs"
import { useBudgetApp } from "@/contexts/budget-app-context"
import type { CurrencyCode } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CUR: CurrencyCode[] = ["MYR", "USD", "EUR", "GBP", "SGD"]

export default function AccountPage() {
  const { currencyCode, setCurrencyCode } = useBudgetApp()
  const [saving, setSaving] = React.useState(false)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your Clerk profile, security, and profile photo. App preferences stay below.
        </p>
      </header>

      <div className="flex w-full justify-center">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full max-w-full shadow-none",
              card: "shadow-sm border border-border/80",
            },
          }}
        />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">App preferences</CardTitle>
          <CardDescription>Currency used for budgets and amounts across the app.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Preferred currency</Label>
            <Select
              value={currencyCode}
              onValueChange={(v) => {
                if (!v) return
                setSaving(true)
                void setCurrencyCode(v as CurrencyCode)
                  .catch((e) => window.alert(e.message))
                  .finally(() => setSaving(false))
              }}
              disabled={saving}
            >
              <SelectTrigger className="w-full max-w-xs">
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
        </CardContent>
      </Card>
    </div>
  )
}
