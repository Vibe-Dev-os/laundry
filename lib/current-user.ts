import { cookies } from "next/headers"
import { connectDB } from "@/lib/db"
import { StaffModel } from "@/lib/models/staff"
import { SESSION_COOKIE, verifySessionCookieValue } from "@/lib/session"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: "owner" | "staff" | "customer"
  businessUnitId: string
  active: boolean
}

// Resolves the logged-in user from the signed session cookie. Returns null if absent/invalid/inactive.
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const staffId = verifySessionCookieValue(store.get(SESSION_COOKIE)?.value)
  if (!staffId) return null

  await connectDB()
  const doc = await StaffModel.findById(staffId).lean<{
    _id: string
    name: string
    email: string
    role: "owner" | "staff" | "customer"
    businessUnitId: string
    active: boolean
  }>()
  if (!doc || !doc.active) return null

  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    businessUnitId: doc.businessUnitId,
    active: doc.active,
  }
}
