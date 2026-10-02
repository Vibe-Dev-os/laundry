import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { ReservationModel } from "@/lib/models/reservation"
import { err, toClientArray } from "@/lib/api-utils"
import { getSessionUser } from "@/lib/current-user"

export async function GET() {
  try {
    await connectDB()
    const user = await getSessionUser()
    // Customers can only ever see their own reservations, never other customers' data.
    const query = user?.role === "customer" ? { email: user.email } : {}
    const docs = await ReservationModel.find(query).sort({ createdAt: -1 }).lean()
    return NextResponse.json(toClientArray(docs))
  } catch (e) {
    return err(String(e), 500)
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const user = await getSessionUser()
    // Never trust client-submitted identity/branch for a customer — stamp it from their session.
    if (user?.role === "customer") {
      body.customerName = user.name
      body.email = user.email
      body.businessUnitId = user.businessUnitId
    }
    const doc = await ReservationModel.create({ ...body, _id: body.id })
    return NextResponse.json(doc.toJSON(), { status: 201 })
  } catch (e) {
    return err(String(e), 500)
  }
}
