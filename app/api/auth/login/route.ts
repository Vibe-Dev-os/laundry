import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { StaffModel } from "@/lib/models/staff"
import { err } from "@/lib/api-utils"
import { verifyPassword } from "@/lib/auth"
import { setSessionCookie } from "@/lib/session"

export async function POST(req: Request) {
  try {
    await connectDB()
    const { email, password } = await req.json()
    if (!email || !password) return err("Email and password are required.", 400)

    const doc = await StaffModel.findOne({ email: String(email).toLowerCase().trim() })
      .select("+passwordHash")
      .lean<{
        _id: string
        name: string
        email: string
        role: string
        businessUnitId: string
        active: boolean
        initials: string
        passwordHash: string
      }>()

    // Same generic error whether the email is unknown or the password is wrong, to avoid user enumeration.
    if (!doc || !(await verifyPassword(password, doc.passwordHash))) {
      return err("Invalid email or password.", 401)
    }
    if (!doc.active) {
      return err("This account has been deactivated. Contact your administrator.", 403)
    }

    const res = NextResponse.json({
      name: doc.name,
      email: doc.email,
      role: doc.role,
      businessUnitId: doc.businessUnitId,
      initials: doc.initials,
    })
    setSessionCookie(res, doc._id)
    return res
  } catch (e) {
    return err(String(e), 500)
  }
}
