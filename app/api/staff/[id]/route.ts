import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { StaffModel } from "@/lib/models/staff"
import { err, toClient } from "@/lib/api-utils"
import { hashPassword } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const { password, ...patch } = await req.json()
    if (password) {
      if (String(password).length < 6) return err("Password must be at least 6 characters.", 400)
      ;(patch as Record<string, unknown>).passwordHash = await hashPassword(password)
    }
    const doc = await StaffModel.findByIdAndUpdate(id, patch, { new: true, lean: true })
    if (!doc) return err("Not found", 404)
    return NextResponse.json(toClient(doc))
  } catch (e) {
    return err(String(e), 500)
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    await StaffModel.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return err(String(e), 500)
  }
}
