"use client"

import { BudgetAppProvider } from "@/contexts/budget-app-context"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BudgetAppProvider>
      <TooltipProvider delay={200}>{children}</TooltipProvider>
    </BudgetAppProvider>
  )
}
