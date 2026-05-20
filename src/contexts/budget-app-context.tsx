"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  DEMO_ADMIN_NAME,
  DEMO_USER_EMAIL,
  DEMO_USER_PHONE,
  DEMO_USERS,
  INITIAL_CATEGORIES,
  INITIAL_MONTHLY_BUDGET,
  INITIAL_NOTIFICATIONS,
  INITIAL_SUPPORT_MESSAGES,
  INITIAL_TRANSACTIONS,
  defaultCurrencyPreference,
  spendByCategory,
} from "@/lib/initial-demo-data"
import type {
  AppNotification,
  Category,
  CurrencyCode,
  DemoUser,
  SupportMessage,
  Transaction,
} from "@/lib/types"

type BudgetAppContextValue = {
  /** User profile (end-user app) */
  userDisplayName: string
  userEmail: string
  userPhone: string
  setUserDisplayName: (v: string) => void
  setUserEmail: (v: string) => void
  setUserPhone: (v: string) => void
  currencyCode: CurrencyCode
  setCurrencyCode: (v: CurrencyCode) => void

  monthlyBudget: number
  setMonthlyBudget: (v: number) => void
  monthlyIncome: number
  totalInvestmentsDisplay: number

  categories: Category[]
  addCategory: (name: string, budget: number) => void
  updateCategory: (id: string, name: string, budget: number) => void
  deleteCategory: (id: string) => void

  transactions: Transaction[]
  addTransaction: (t: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void

  notifications: AppNotification[]
  deleteNotification: (id: string) => void

  supportMessages: SupportMessage[]
  deleteSupportMessage: (id: string) => void
  addSupportMessage: (m: Omit<SupportMessage, "id" | "submittedAt">) => void

  adminDemoUsers: DemoUser[]
  setAdminDemoUsers: React.Dispatch<React.SetStateAction<DemoUser[]>>

  spendMap: Record<string, number>
  totalExpenseThisMonth: number
  overallRemaining: number

  /** Admin profile (separate from end user) */
  adminDisplayName: string
  adminEmail: string
  adminPhone: string
  setAdminDisplayName: (v: string) => void
  setAdminEmail: (v: string) => void
  setAdminPhone: (v: string) => void

  logout: () => void
}

const BudgetAppContext = React.createContext<BudgetAppContextValue | null>(null)

export function BudgetAppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userDisplayName, setUserDisplayName] = React.useState("Mashuk")
  const [userEmail, setUserEmail] = React.useState(DEMO_USER_EMAIL)
  const [userPhone, setUserPhone] = React.useState(DEMO_USER_PHONE)
  const [currencyCode, setCurrencyCode] =
    React.useState<CurrencyCode>(defaultCurrencyPreference)

  const [monthlyBudget, setMonthlyBudget] = React.useState(INITIAL_MONTHLY_BUDGET)
  const [monthlyIncome] = React.useState(8500)
  const [totalInvestmentsDisplay] = React.useState(15300)

  const [categories, setCategories] = React.useState<Category[]>(() => [
    ...INITIAL_CATEGORIES,
  ])
  const [transactions, setTransactions] = React.useState<Transaction[]>(() => [
    ...INITIAL_TRANSACTIONS,
  ])

  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    () => [...INITIAL_NOTIFICATIONS]
  )

  const [supportMessages, setSupportMessages] = React.useState<SupportMessage[]>(
    () => [...INITIAL_SUPPORT_MESSAGES]
  )

  const [adminDemoUsers, setAdminDemoUsers] = React.useState<DemoUser[]>(() => [
    ...DEMO_USERS,
  ])

  const [adminDisplayName, setAdminDisplayName] = React.useState(DEMO_ADMIN_NAME)
  const [adminEmail, setAdminEmail] = React.useState("admin@budgettracker.example")
  const [adminPhone, setAdminPhone] = React.useState("+60 3-1234 0000")

  const spendMap = React.useMemo(() => spendByCategory(transactions), [transactions])

  const totalExpenseThisMonth = React.useMemo(
    () => Object.values(spendMap).reduce((a, b) => a + b, 0),
    [spendMap]
  )

  const overallRemaining = Math.max(0, monthlyBudget - totalExpenseThisMonth)

  const addCategory = React.useCallback((name: string, budgetAllocated: number) => {
    setCategories((prev) => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        budgetAllocated,
      },
    ])
  }, [])

  const updateCategory = React.useCallback(
    (id: string, name: string, budgetAllocated: number) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: name.trim(), budgetAllocated } : c))
      )
    },
    []
  )

  const deleteCategory = React.useCallback((id: string) => {
    if (id === "cat-income") return
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setTransactions((prev) => prev.filter((t) => t.categoryId !== id))
  }, [])

  const addTransaction = React.useCallback((partial: Omit<Transaction, "id">) => {
    setTransactions((prev) => {
      const tx: Transaction = {
        ...partial,
        id: `t-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      }
      const next = [tx, ...prev]
      if (partial.type === "expense") {
        const sm = spendByCategory(next)
        const cat = categories.find((c) => c.id === partial.categoryId)
        const spentAfter = sm[partial.categoryId] ?? 0
        if (cat && spentAfter >= cat.budgetAllocated) {
          setNotifications((prevN) => [
            {
              id: `n-${Date.now()}`,
              title: `${cat.name} budget`,
              body:
                spentAfter > cat.budgetAllocated
                  ? `Spending exceeded the budget for ${cat.name}.`
                  : `You reached the planned budget cap for ${cat.name}.`,
              createdAt: new Date().toISOString(),
              variant: spentAfter > cat.budgetAllocated ? "destructive" : "warning",
              kind: spentAfter > cat.budgetAllocated ? "over_budget" : "threshold",
            },
            ...prevN,
          ])
        }
      }
      return next
    })
  }, [categories])

  const deleteTransaction = React.useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const deleteNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const deleteSupportMessage = React.useCallback((id: string) => {
    setSupportMessages((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const addSupportMessage = React.useCallback(
    (m: Omit<SupportMessage, "id" | "submittedAt">) => {
      setSupportMessages((prev) => [
        {
          ...m,
          id: `s-${Date.now()}`,
          submittedAt: new Date().toISOString(),
        },
        ...prev,
      ])
    },
    []
  )

  const logout = React.useCallback(() => {
    router.push("/dashboard")
  }, [router])

  const value = React.useMemo<BudgetAppContextValue>(
    () => ({
      userDisplayName,
      userEmail,
      userPhone,
      setUserDisplayName,
      setUserEmail,
      setUserPhone,
      currencyCode,
      setCurrencyCode,
      monthlyBudget,
      setMonthlyBudget,
      monthlyIncome,
      totalInvestmentsDisplay,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      transactions,
      addTransaction,
      deleteTransaction,
      notifications,
      deleteNotification,
      supportMessages,
      deleteSupportMessage,
      addSupportMessage,
      adminDemoUsers,
      setAdminDemoUsers,
      spendMap,
      totalExpenseThisMonth,
      overallRemaining,
      adminDisplayName,
      adminEmail,
      adminPhone,
      setAdminDisplayName,
      setAdminEmail,
      setAdminPhone,
      logout,
    }),
    [
      userDisplayName,
      userEmail,
      userPhone,
      currencyCode,
      monthlyBudget,
      monthlyIncome,
      totalInvestmentsDisplay,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      transactions,
      addTransaction,
      deleteTransaction,
      notifications,
      deleteNotification,
      supportMessages,
      deleteSupportMessage,
      addSupportMessage,
      adminDemoUsers,
      spendMap,
      totalExpenseThisMonth,
      overallRemaining,
      adminDisplayName,
      adminEmail,
      adminPhone,
      logout,
    ]
  )

  return (
    <BudgetAppContext.Provider value={value}>{children}</BudgetAppContext.Provider>
  )
}

export function useBudgetApp() {
  const ctx = React.useContext(BudgetAppContext)
  if (!ctx) throw new Error("useBudgetApp must be used within BudgetAppProvider")
  return ctx
}

