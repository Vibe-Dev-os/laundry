import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { BusinessUnitModel } from "@/lib/models/business-unit"
import { err, toClient } from "@/lib/api-utils"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const patch = await req.json()
    const doc = await BusinessUnitModel.findByIdAndUpdate(id, patch, { new: true, lean: true })
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
    await BusinessUnitModel.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return err(String(e), 500)
  }
}
