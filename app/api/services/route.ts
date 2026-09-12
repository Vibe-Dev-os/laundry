import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { ServiceModel } from "@/lib/models/service"
import { err, toClientArray } from "@/lib/api-utils"

export async function GET() {
  try {
    await connectDB()
    const docs = await ServiceModel.find().lean()
    return NextResponse.json(toClientArray(docs))
  } catch (e) {
    return err(String(e), 500)
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const doc = await ServiceModel.create({ ...body, _id: body.id })
    return NextResponse.json(doc.toJSON(), { status: 201 })
  } catch (e) {
    return err(String(e), 500)
  }
}
