import type { User } from "@clerk/backend"

export type AdminUserRow = {
  id: string
  username: string | null
  email: string | null
  joinedAt: string | null
  lastSignInAt: string | null
  locked: boolean
  banned: boolean
}

function primaryEmail(user: User): string | null {
  const primaryId = user.primaryEmailAddressId
  if (!primaryId) return user.emailAddresses[0]?.emailAddress ?? null
  return user.emailAddresses.find((e) => e.id === primaryId)?.emailAddress ?? null
}

function toIso(value: Date | number | null | undefined): string | null {
  if (value == null) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function mapClerkUserToRow(user: User): AdminUserRow {
  return {
    id: user.id,
    username: user.username ?? null,
    email: primaryEmail(user),
    joinedAt: toIso(user.createdAt),
    lastSignInAt: toIso(user.lastSignInAt),
    locked: Boolean(user.locked),
    banned: Boolean(user.banned),
  }
}

export function formatAdminUserDate(iso: string | null): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}
