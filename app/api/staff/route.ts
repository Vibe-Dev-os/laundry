import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { StaffModel } from "@/lib/models/staff"
import { err, toClientArray } from "@/lib/api-utils"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()
    const docs = await StaffModel.find().lean()
    return NextResponse.json(toClientArray(docs))
  } catch (e) {
    return err(String(e), 500)
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const { password, ...rest } = body
    if (!password || String(password).length < 6) {
      return err("Password must be at least 6 characters.", 400)
    }
    const passwordHash = await hashPassword(password)
    const doc = await StaffModel.create({ ...rest, _id: body.id, passwordHash })
    return NextResponse.json(doc.toJSON(), { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes("E11000")) return err("A staff member with this email already exists.", 409)
    return err(message, 500)
  }
}
