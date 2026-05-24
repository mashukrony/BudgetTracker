export const INCOME_CATEGORY_NAME = "Income"

export function isIncomeCategoryName(name: string): boolean {
  return name.trim().toLowerCase() === INCOME_CATEGORY_NAME.toLowerCase()
}
