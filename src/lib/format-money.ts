import type { CurrencyCode } from "@/lib/types"

const SYMBOLS: Record<CurrencyCode, string> = {
  MYR: "RM ",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SGD: "S$",
}

export function formatMoney(amount: number, code: CurrencyCode): string {
  const symbol = SYMBOLS[code]
  const abs = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const prefix = amount < 0 ? "-" : ""
  if (code === "EUR") return `${prefix}${symbol}${abs}`
  return `${prefix}${symbol}${abs}`
}
