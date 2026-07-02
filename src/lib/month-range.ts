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

/** Format a Date as yyyy-mm-dd in local time (avoids UTC day-shift bugs). */
export function toDateInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Parse yyyy-mm-dd as local calendar date (noon avoids DST edge cases). */
export function parseDateInput(value: string): Date {
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return new Date(Number.NaN)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

export function isDateInRange(dateStr: string, monthStart: Date, monthEnd: Date): boolean {
  const d = parseDateInput(dateStr)
  if (Number.isNaN(d.getTime())) return false
  return d >= monthStart && d <= monthEnd
}
