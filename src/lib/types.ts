export type CurrencyCode = "MYR" | "USD" | "EUR" | "GBP" | "SGD"

export type TxType = "income" | "expense"

export interface Category {
  id: string
  name: string
  budgetAllocated: number
}

export interface Transaction {
  id: string
  title: string
  categoryId: string
  /** ISO date string yyyy-mm-dd */
  date: string
  /** Positive amount */
  amount: number
  type: TxType
}

export interface AppNotification {
  id: string
  title: string
  body: string
  createdAt: string
  variant: "warning" | "success" | "info" | "destructive"
  /** Keywords for UX hints */
  kind: string
}

