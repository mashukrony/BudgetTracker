/** Calendar month boundaries in local time (stored as UTC midnight of 1st). */
export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function previousMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

export function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10)
}
