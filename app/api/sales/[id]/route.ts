import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { SaleModel } from "@/lib/models/sale"
import { err, toClient } from "@/lib/api-utils"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const patch = await req.json()
    const doc = await SaleModel.findByIdAndUpdate(id, patch, { new: true, lean: true })
    if (!doc) return err("Not found", 404)
    return NextResponse.json(toClient(doc))
  } catch (e) {
    return err(String(e), 500)
  }
}
