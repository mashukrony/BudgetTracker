import type { User } from "@clerk/backend"

export function roleFromPublicMetadata(user: User | null | undefined): string | undefined {
  const role = user?.publicMetadata?.role
  return typeof role === "string" ? role : undefined
}

export function isAdminRole(role: string | undefined): role is "admin" {
  return role === "admin"
}

/** Reads role from Clerk session JWT (incl. custom template `metadata: {{user.public_metadata}}`). */
export function roleFromSessionClaims(sessionClaims: unknown): string | undefined {
  if (!sessionClaims || typeof sessionClaims !== "object") return undefined
  const claims = sessionClaims as Record<string, unknown>

  const metadata = claims.metadata
  if (metadata && typeof metadata === "object" && "role" in metadata) {
    const role = (metadata as { role?: unknown }).role
    if (typeof role === "string") return role
  }

  const publicMeta = claims.public_metadata ?? claims.publicMetadata
  if (publicMeta && typeof publicMeta === "object" && "role" in publicMeta) {
    const role = (publicMeta as { role?: unknown }).role
    if (typeof role === "string") return role
  }

  return undefined
}

export function resolveUserRole(
  sessionClaims: unknown,
  user: User | null | undefined
): string | undefined {
  return roleFromSessionClaims(sessionClaims) ?? roleFromPublicMetadata(user)
}
