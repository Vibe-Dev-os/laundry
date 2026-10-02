import { StaffModel } from "@/lib/models/staff"
import { BusinessUnitModel } from "@/lib/models/business-unit"
import { hashPassword } from "@/lib/auth"

let seeded = false

// Ensures a fixed owner account exists, sourced only from env vars — never from a public "create owner" form.
export async function ensureAdminSeeded() {
  if (seeded) return
  seeded = true

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return

  const existing = await StaffModel.findOne({ email })
  if (existing) return

  const ownerCount = await StaffModel.countDocuments({ role: "owner" })
  if (ownerCount > 0) return

  let businessUnitId = (await BusinessUnitModel.findOne().lean<{ _id: string }>())?._id
  if (!businessUnitId) {
    businessUnitId = `bu-${Date.now()}`
    await BusinessUnitModel.create({
      _id: businessUnitId,
      name: process.env.ADMIN_BUSINESS_NAME?.trim() || "My Business",
      contact: "",
      address: "",
      shareCustomerDb: true,
    })
  }

  const name = process.env.ADMIN_NAME?.trim() || "Admin"
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  await StaffModel.create({
    _id: `staff-${Date.now()}`,
    name,
    email,
    passwordHash: await hashPassword(password),
    role: "owner",
    businessUnitId,
    active: true,
    initials,
  })
}
