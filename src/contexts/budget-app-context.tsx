"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { upsertMonthlyBudget } from "@/app/actions/budgets"
import { createCategory, deleteCategory, updateCategory } from "@/app/actions/categories"
import { deleteNotification } from "@/app/actions/notifications"
import { createSupportTicket } from "@/app/actions/support"
import { createTransaction, deleteTransaction, updateTransaction } from "@/app/actions/transactions"
import { updateCurrency } from "@/app/actions/user-preferences"
import { isIncomeCategoryName } from "@/lib/budget-constants"
import type { UserBudgetSnapshot } from "@/lib/queries/user-snapshot"
import type {
  AppNotification,
  Category,
  CurrencyCode,
  Transaction,
  TxType,
} from "@/lib/types"
import { NotificationAlertBanner } from "@/components/notification-alert-banner"

type BudgetAppContextValue = UserBudgetSnapshot & {
  setMonthlyBudget: (amount: number) => Promise<void>
  setCurrencyCode: (code: CurrencyCode) => Promise<void>
  addCategory: (name: string, budget: number) => Promise<void>
  updateCategory: (id: string, name: string, budget: number) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>
  updateTransaction: (id: string, t: Omit<Transaction, "id">) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addSupportMessage: (input: { subject: string; message: string }) => Promise<void>
  isIncomeCategory: (category: Category) => boolean
}

const BudgetAppContext = React.createContext<BudgetAppContextValue | null>(null)

async function runAction<T extends { ok: boolean; error?: string }>(
  action: () => Promise<T>,
  router: ReturnType<typeof useRouter>
) {
  const result = await action()
  if (!result.ok) {
    throw new Error(result.error ?? "Something went wrong.")
  }
  router.refresh()
}

export function BudgetAppProvider({
  children,
  initial,
}: {
  children: React.ReactNode
  initial: UserBudgetSnapshot
}) {
  const router = useRouter()
  const [snapshot, setSnapshot] = React.useState(initial)

  React.useEffect(() => {
    setSnapshot(initial)
  }, [initial])

  const setMonthlyBudget = React.useCallback(
    async (amount: number) => {
      await runAction(() => upsertMonthlyBudget(amount), router)
    },
    [router]
  )

  const setCurrencyCode = React.useCallback(
    async (code: CurrencyCode) => {
      await runAction(() => updateCurrency(code), router)
    },
    [router]
  )

  const addCategory = React.useCallback(
    async (name: string, budgetAllocated: number) => {
      await runAction(() => createCategory(name, budgetAllocated), router)
    },
    [router]
  )

  const updateCategoryFn = React.useCallback(
    async (id: string, name: string, budgetAllocated: number) => {
      await runAction(() => updateCategory(id, name, budgetAllocated), router)
    },
    [router]
  )

  const deleteCategoryFn = React.useCallback(
    async (id: string) => {
      await runAction(() => deleteCategory(id), router)
    },
    [router]
  )

  const addTransactionFn = React.useCallback(
    async (partial: Omit<Transaction, "id">) => {
      await runAction(
        () =>
          createTransaction({
            title: partial.title,
            categoryId: partial.categoryId,
            date: partial.date,
            amount: partial.amount,
            type: partial.type as TxType,
          }),
        router
      )
    },
    [router]
  )

  const deleteTransactionFn = React.useCallback(
    async (id: string) => {
      await runAction(() => deleteTransaction(id), router)
    },
    [router]
  )

  const updateTransactionFn = React.useCallback(
    async (id: string, partial: Omit<Transaction, "id">) => {
      await runAction(
        () =>
          updateTransaction(id, {
            title: partial.title,
            categoryId: partial.categoryId,
            date: partial.date,
            amount: partial.amount,
            type: partial.type as TxType,
          }),
        router
      )
    },
    [router]
  )

  const deleteNotificationFn = React.useCallback(
    async (id: string) => {
      await runAction(() => deleteNotification(id), router)
    },
    [router]
  )

  const addSupportMessage = React.useCallback(
    async (input: { subject: string; message: string }) => {
      await runAction(() => createSupportTicket(input), router)
    },
    [router]
  )

  const value = React.useMemo<BudgetAppContextValue>(
    () => ({
      ...snapshot,
      setMonthlyBudget,
      setCurrencyCode,
      addCategory,
      updateCategory: updateCategoryFn,
      deleteCategory: deleteCategoryFn,
      addTransaction: addTransactionFn,
      updateTransaction: updateTransactionFn,
      deleteTransaction: deleteTransactionFn,
      deleteNotification: deleteNotificationFn,
      addSupportMessage,
      isIncomeCategory: (c) => isIncomeCategoryName(c.name),
    }),
    [
      snapshot,
      setMonthlyBudget,
      setCurrencyCode,
      addCategory,
      updateCategoryFn,
      deleteCategoryFn,
      addTransactionFn,
      updateTransactionFn,
      deleteTransactionFn,
      deleteNotificationFn,
      addSupportMessage,
    ]
  )

  return (
    <BudgetAppContext.Provider value={value}>
      <NotificationAlertBanner notifications={snapshot.notifications} />
      {children}
    </BudgetAppContext.Provider>
  )
}

export function useBudgetApp() {
  const ctx = React.useContext(BudgetAppContext)
  if (!ctx) throw new Error("useBudgetApp must be used within BudgetAppProvider")
  return ctx
}

export type { AppNotification }
