import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { BusinessUnitModel } from "@/lib/models/business-unit"
import { StaffModel } from "@/lib/models/staff"
import { ServiceModel } from "@/lib/models/service"
import { ReservationModel } from "@/lib/models/reservation"
import { SaleModel } from "@/lib/models/sale"
import { NotificationModel } from "@/lib/models/notification"
import { TemplateModel } from "@/lib/models/template"
import {
  BUSINESS_UNITS,
  SERVICES,
  STAFF,
  TEMPLATES,
  generateReservations,
  generateSales,
  generateNotifications,
} from "@/lib/mock-data"

// POST /api/seed  — seeds the DB with mock data if all collections are empty.
// Add ?force=true to clear and re-seed.
export async function POST(req: Request) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const force = url.searchParams.get("force") === "true"

    if (force) {
      await Promise.all([
        BusinessUnitModel.deleteMany({}),
        StaffModel.deleteMany({}),
        ServiceModel.deleteMany({}),
        ReservationModel.deleteMany({}),
        SaleModel.deleteMany({}),
        NotificationModel.deleteMany({}),
        TemplateModel.deleteMany({}),
      ])
    } else {
      // Only seed if collections are empty
      const [buCount] = await Promise.all([BusinessUnitModel.countDocuments({})])
      if (buCount > 0) {
        return NextResponse.json({ message: "Already seeded. Use ?force=true to re-seed." })
      }
    }

    const reservations = generateReservations()
    const sales = generateSales()
    const notifications = generateNotifications()

    await Promise.all([
      BusinessUnitModel.insertMany(BUSINESS_UNITS.map((d) => ({ ...d, _id: d.id }))),
      StaffModel.insertMany(STAFF.map((d) => ({ ...d, _id: d.id }))),
      ServiceModel.insertMany(SERVICES.map((d) => ({ ...d, _id: d.id }))),
      ReservationModel.insertMany(reservations.map((d) => ({ ...d, _id: d.id }))),
      SaleModel.insertMany(sales.map((d) => ({ ...d, _id: d.id }))),
      NotificationModel.insertMany(notifications.map((d) => ({ ...d, _id: d.id }))),
      TemplateModel.insertMany(TEMPLATES.map((d) => ({ ...d, _id: d.id }))),
    ])

    return NextResponse.json({
      message: "Seeded successfully",
      counts: {
        businessUnits: BUSINESS_UNITS.length,
        staff: STAFF.length,
        services: SERVICES.length,
        reservations: reservations.length,
        sales: sales.length,
        notifications: notifications.length,
        templates: TEMPLATES.length,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
