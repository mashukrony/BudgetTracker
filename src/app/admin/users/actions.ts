"use server"

import { clerkClient } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { mapClerkUserToRow, type AdminUserRow } from "@/lib/admin-users"
import { requireAdmin } from "@/lib/require-admin"

const USERS_PATH = "/admin/users"

async function guardAdmin() {
  try {
    return await requireAdmin()
  } catch {
    throw new Error("You must be signed in as an admin to manage users.")
  }
}

export async function listClerkUsers(): Promise<AdminUserRow[]> {
  await guardAdmin()
  const client = await clerkClient()
  const { data } = await client.users.getUserList({
    limit: 100,
    orderBy: "-created_at",
  })
  return data.map(mapClerkUserToRow)
}

export async function createClerkUser(input: {
  emailAddress: string
  password: string
  username?: string
  firstName?: string
  lastName?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardAdmin()

  const emailAddress = input.emailAddress.trim()
  const password = input.password
  if (!emailAddress.includes("@")) {
    return { ok: false, error: "Enter a valid email address." }
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." }
  }

  try {
    const client = await clerkClient()
    await client.users.createUser({
      emailAddress: [emailAddress],
      password,
      ...(input.username?.trim() ? { username: input.username.trim() } : {}),
      ...(input.firstName?.trim() ? { firstName: input.firstName.trim() } : {}),
      ...(input.lastName?.trim() ? { lastName: input.lastName.trim() } : {}),
    })
    revalidatePath(USERS_PATH)
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create user."
    return { ok: false, error: message }
  }
}

export async function setClerkUserLocked(
  userId: string,
  locked: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId: actorId } = await guardAdmin()
  if (userId === actorId) {
    return { ok: false, error: "You cannot lock your own account." }
  }

  try {
    const client = await clerkClient()
    if (locked) {
      await client.users.lockUser(userId)
    } else {
      await client.users.unlockUser(userId)
    }
    revalidatePath(USERS_PATH)
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update lock status."
    return { ok: false, error: message }
  }
}

export async function setClerkUserBanned(
  userId: string,
  banned: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId: actorId } = await guardAdmin()
  if (userId === actorId) {
    return { ok: false, error: "You cannot ban your own account." }
  }

  try {
    const client = await clerkClient()
    if (banned) {
      await client.users.banUser(userId)
    } else {
      await client.users.unbanUser(userId)
    }
    revalidatePath(USERS_PATH)
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update ban status."
    return { ok: false, error: message }
  }
}

export async function deleteClerkUser(
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId: actorId } = await guardAdmin()
  if (userId === actorId) {
    return { ok: false, error: "You cannot delete your own account." }
  }

  try {
    const client = await clerkClient()
    await client.users.deleteUser(userId)
    revalidatePath(USERS_PATH)
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete user."
    return { ok: false, error: message }
  }
}
