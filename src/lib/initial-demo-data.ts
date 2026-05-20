import type {
  AppNotification,
  Category,
  CurrencyCode,
  DemoUser,
  SupportMessage,
  Transaction,
} from "@/lib/types"

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-income", name: "Income", budgetAllocated: 8500 },
  { id: "cat-food", name: "Food & Dining", budgetAllocated: 2000 },
  { id: "cat-transport", name: "Transportation", budgetAllocated: 1000 },
  { id: "cat-shopping", name: "Shopping", budgetAllocated: 1500 },
  { id: "cat-entertainment", name: "Entertainment", budgetAllocated: 800 },
  { id: "cat-bills", name: "Bills & Utilities", budgetAllocated: 1200 },
  { id: "cat-health", name: "Healthcare", budgetAllocated: 500 },
]

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    title: "Pizza Hut",
    categoryId: "cat-food",
    date: new Date().toISOString().slice(0, 10),
    amount: 45.5,
    type: "expense",
  },
  {
    id: "t2",
    title: "Grab",
    categoryId: "cat-transport",
    date: new Date().toISOString().slice(0, 10),
    amount: 18.7,
    type: "expense",
  },
  {
    id: "t3",
    title: "Shopee",
    categoryId: "cat-shopping",
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    amount: 125,
    type: "expense",
  },
  {
    id: "t4",
    title: "Salary Deposit",
    categoryId: "cat-income",
    date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`,
    amount: 8500,
    type: "income",
  },
  {
    id: "t5",
    title: "Netflix",
    categoryId: "cat-entertainment",
    date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`,
    amount: 35,
    type: "expense",
  },
  {
    id: "t6",
    title: "Groceries",
    categoryId: "cat-food",
    date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-05`,
    amount: 210,
    type: "expense",
  },
  {
    id: "t7",
    title: "Electric bill",
    categoryId: "cat-bills",
    date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-08`,
    amount: 340,
    type: "expense",
  },
]

export function spendByCategory(transactions: Transaction[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of transactions) {
    if (t.type === "expense") {
      map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount
    }
  }
  return map
}

export const INITIAL_MONTHLY_BUDGET = 8500

export const DEMO_ADMIN_NAME = "Admin"
export const DEMO_USER_EMAIL = "mashuk@example.com"
export const DEMO_USER_PHONE = "+60 12-345 6789"

/** Placeholder KPIs aligned with dashboard.html */
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "Category nearing limit",
    body: "Food & Dining has used over 57% of its monthly budget.",
    createdAt: new Date().toISOString(),
    variant: "warning",
    kind: "category_threshold",
  },
  {
    id: "n2",
    title: "Bills & Utilities",
    body: "You have reached 100% of the budget for Bills & Utilities.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    variant: "destructive",
    kind: "over_budget",
  },
  {
    id: "n3",
    title: "Savings highlight",
    body: "You saved about 2,260 against your overall budget this month (demo wording).",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    variant: "success",
    kind: "savings",
  },
  {
    id: "n4",
    title: "Top spending category",
    body: "Shopping was your highest spend category last week.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    variant: "info",
    kind: "insight",
  },
]

export const INITIAL_SUPPORT_MESSAGES: SupportMessage[] = [
  {
    id: "s1",
    username: "Lina K.",
    email: "lina@example.com",
    subject: "Cannot edit category budget",
    message: "The save button freezes when I reduce a category budget.",
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "s2",
    username: "Ravi M.",
    email: "ravi@example.com",
    subject: "Export transactions",
    message: "Is there CSV export planned?",
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const DEMO_USERS: DemoUser[] = [
  {
    id: "u1",
    name: "Mashuk Ahmad",
    email: "mashuk@example.com",
    joinDate: "2025-06-02",
    status: "Active",
    lastActive: new Date().toISOString().slice(0, 10),
  },
  {
    id: "u2",
    name: "Lina Kamaruddin",
    email: "lina@example.com",
    joinDate: "2025-08-17",
    status: "Active",
    lastActive: "2026-05-08",
  },
  {
    id: "u3",
    name: "Ravi Menon",
    email: "ravi@example.com",
    joinDate: "2024-11-30",
    status: "Suspended",
    lastActive: "2026-03-02",
  },
]

export function defaultCurrencyPreference(): CurrencyCode {
  return "MYR"
}
