import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { StaffModel } from "@/lib/models/staff"
import { BusinessUnitModel } from "@/lib/models/business-unit"
import { err } from "@/lib/api-utils"
import { hashPassword } from "@/lib/auth"
import { setSessionCookie } from "@/lib/session"

// Public self-registration for customers only — staff/owner accounts are created from Settings or env-seeded.
export async function POST(req: Request) {
  try {
    await connectDB()
    const { name, email, password, businessUnitId } = await req.json()
    if (!name?.trim() || !email?.trim() || !password) {
      return err("Name, email, and password are required.", 400)
    }
    if (String(password).length < 6) return err("Password must be at least 6 characters.", 400)

    const businessUnits = await BusinessUnitModel.find().lean<{ _id: string }[]>()
    if (businessUnits.length === 0) {
      return err("No business is set up yet. Please try again later.", 409)
    }
    const targetBU = businessUnitId && businessUnits.some((b) => b._id === businessUnitId)
      ? businessUnitId
      : businessUnits[0]._id

    const initials = name
      .trim()
      .split(/\s+/)
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

    const passwordHash = await hashPassword(password)
    const staffId = `staff-${Date.now()}`
    await StaffModel.create({
      _id: staffId,
      name: name.trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: "customer",
      businessUnitId: targetBU,
      active: true,
      initials,
    })

    const res = NextResponse.json(
      {
        name: name.trim(),
        email: String(email).toLowerCase().trim(),
        role: "customer",
        businessUnitId: targetBU,
        initials,
      },
      { status: 201 }
    )
    setSessionCookie(res, staffId)
    return res
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes("E11000")) return err("An account with this email already exists.", 409)
    return err(message, 500)
  }
}
