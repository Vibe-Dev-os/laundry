import type {
  BusinessUnit,
  MessageTemplate,
  NotificationLogEntry,
  Reservation,
  Sale,
  ServicePricing,
  StaffMember,
} from "./types"

export const BUSINESS_UNITS: BusinessUnit[] = [
  {
    id: "bu-ladrops",
    name: "LA Drops Laundry",
    contact: "(02) 8123 4567",
    address: "142 Kalayaan Ave, Diliman, Quezon City",
    shareCustomerDb: true,
  },
  {
    id: "bu-sister",
    name: "Sister Business Co.",
    contact: "(02) 8987 6543",
    address: "88 Aurora Blvd, Cubao, Quezon City",
    shareCustomerDb: true,
  },
]

export const SERVICES: ServicePricing[] = [
  { id: "svc-1", name: "Wash & Fold", key: "wash-fold", unit: "per-kilo", price: 65, businessUnitId: "bu-ladrops" },
  { id: "svc-2", name: "Wash & Iron", key: "wash-iron", unit: "per-kilo", price: 85, businessUnitId: "bu-ladrops" },
  { id: "svc-3", name: "Dry Clean", key: "dry-clean", unit: "per-load", price: 250, businessUnitId: "bu-ladrops" },
  { id: "svc-4", name: "Comforter / Bulky", key: "comforter", unit: "per-load", price: 350, businessUnitId: "bu-ladrops" },
  { id: "svc-5", name: "Wash & Fold", key: "wash-fold", unit: "per-kilo", price: 70, businessUnitId: "bu-sister" },
  { id: "svc-6", name: "Wash & Iron", key: "wash-iron", unit: "per-kilo", price: 90, businessUnitId: "bu-sister" },
  { id: "svc-7", name: "Dry Clean", key: "dry-clean", unit: "per-load", price: 270, businessUnitId: "bu-sister" },
  { id: "svc-8", name: "Comforter / Bulky", key: "comforter", unit: "per-load", price: 380, businessUnitId: "bu-sister" },
]

export const STAFF: StaffMember[] = [
  { id: "staff-1", name: "Marisol Cruz", email: "marisol@ladrops.ph", role: "owner", businessUnitId: "bu-ladrops", active: true, transactionsHandled: 142, salesProcessed: 186400, voidedTransactions: 2, initials: "MC" },
  { id: "staff-2", name: "Jerome Bautista", email: "jerome@ladrops.ph", role: "staff", businessUnitId: "bu-ladrops", active: true, transactionsHandled: 98, salesProcessed: 121300, voidedTransactions: 1, initials: "JB" },
  { id: "staff-3", name: "Angela Reyes", email: "angela@ladrops.ph", role: "staff", businessUnitId: "bu-ladrops", active: true, transactionsHandled: 210, salesProcessed: 156800, voidedTransactions: 4, initials: "AR" },
  { id: "staff-4", name: "Paolo Santos", email: "paolo@ladrops.ph", role: "staff", businessUnitId: "bu-ladrops", active: true, transactionsHandled: 175, salesProcessed: 132900, voidedTransactions: 0, initials: "PS" },
  { id: "staff-5", name: "Kristine Villanueva", email: "kristine@sisterco.ph", role: "staff", businessUnitId: "bu-sister", active: true, transactionsHandled: 88, salesProcessed: 98500, voidedTransactions: 1, initials: "KV" },
  { id: "staff-6", name: "Dennis Ramos", email: "dennis@sisterco.ph", role: "staff", businessUnitId: "bu-sister", active: false, transactionsHandled: 64, salesProcessed: 71200, voidedTransactions: 3, initials: "DR" },
]

export const TEMPLATES: MessageTemplate[] = [
  { id: "tpl-1", name: "Order Ready", message: "Hi {name}! Your laundry order is ready for pickup at LA Drops Laundry. See you soon!" },
  { id: "tpl-2", name: "Payment Reminder", message: "Hi {name}, this is a friendly reminder that payment for your order is still pending. Please settle at your earliest convenience." },
  { id: "tpl-3", name: "Thank You", message: "Thank you for choosing LA Drops Laundry, {name}! We hope to serve you again soon." },
  { id: "tpl-4", name: "Pickup Reminder", message: "Hi {name}, your scheduled pickup is coming up tomorrow. We look forward to serving you!" },
]

const CUSTOMER_NAMES = [
  "Maria Santos", "Juan Dela Cruz", "Ana Lopez", "Carlos Mendoza", "Grace Tan",
  "Ricardo Villar", "Bianca Gomez", "Miguel Torres", "Sofia Ramirez", "Diego Aquino",
  "Camille Ortiz", "Nathaniel Cruz", "Isabel Fernandez", "Rafael Domingo", "Patricia Alonzo",
  "Leo Navarro", "Trisha Mercado", "Victor Salazar", "Andrea Cabrera", "Emmanuel Rosales",
  "Kim Uy", "Bea Castillo", "Oscar Padilla", "Nadia Guerrero", "Tomas Pascual",
]

const SERVICE_KEYS = ["wash-fold", "wash-iron", "dry-clean", "comforter"] as const
const STATUS_POOL: Reservation["status"][] = ["pending", "received", "washing", "drying", "ready", "claimed", "claimed", "cancelled"]

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const rand = seededRandom(42)

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function phoneNumber() {
  return `09${Math.floor(100000000 + rand() * 899999999)}`
}

function daysAgo(days: number, hour = 9) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, Math.floor(rand() * 60), 0, 0)
  return d.toISOString()
}

function daysFromNow(days: number, hour = 9) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, Math.floor(rand() * 60), 0, 0)
  return d.toISOString()
}

export function generateReservations(): Reservation[] {
  const list: Reservation[] = []
  for (let i = 0; i < 22; i++) {
    const name = pick(CUSTOMER_NAMES)
    const serviceKey = pick(SERVICE_KEYS)
    const businessUnitId = i % 3 === 0 ? "bu-sister" : "bu-ladrops"
    const isUpcoming = i < 6
    const status = isUpcoming ? pick(["pending", "received"] as const) : pick(STATUS_POOL)
    list.push({
      id: `res-${1000 + i}`,
      customerName: name,
      contact: phoneNumber(),
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      serviceKey,
      kilos: serviceKey === "dry-clean" || serviceKey === "comforter" ? Math.ceil(rand() * 3) : Math.round((3 + rand() * 8) * 10) / 10,
      scheduledAt: isUpcoming ? daysFromNow(Math.floor(rand() * 5) + 1) : daysAgo(Math.floor(rand() * 14) + 1),
      status,
      businessUnitId,
      notes: rand() > 0.7 ? "Please use fragrance-free detergent." : undefined,
      createdAt: daysAgo(Math.floor(rand() * 15) + 1),
    })
  }
  return list
}

function priceFor(serviceKey: (typeof SERVICE_KEYS)[number], businessUnitId: string) {
  const svc = SERVICES.find((s) => s.key === serviceKey && s.businessUnitId === businessUnitId)
  return svc?.price ?? 65
}

function serviceName(serviceKey: (typeof SERVICE_KEYS)[number]) {
  const map: Record<string, string> = {
    "wash-fold": "Wash & Fold",
    "wash-iron": "Wash & Iron",
    "dry-clean": "Dry Clean",
    comforter: "Comforter / Bulky",
  }
  return map[serviceKey]
}

export function generateSales(): Sale[] {
  const list: Sale[] = []
  const cashiers = ["Angela Reyes", "Paolo Santos", "Jerome Bautista", "Kristine Villanueva", "Dennis Ramos"]
  const methods: Sale["paymentMethod"][] = ["cash", "gcash", "card"]
  for (let i = 0; i < 20; i++) {
    const name = pick(CUSTOMER_NAMES)
    const businessUnitId = i % 3 === 0 ? "bu-sister" : "bu-ladrops"
    const itemCount = 1 + Math.floor(rand() * 2)
    const items = Array.from({ length: itemCount }).map(() => {
      const serviceKey = pick(SERVICE_KEYS)
      const qty = Math.round((1 + rand() * 6) * 10) / 10
      const unitPrice = priceFor(serviceKey, businessUnitId)
      return {
        serviceKey,
        name: serviceName(serviceKey),
        unitPrice,
        qty,
        lineTotal: Math.round(unitPrice * qty),
      }
    })
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
    const discount = rand() > 0.85 ? Math.round(subtotal * 0.1) : 0
    const tax = 0
    const total = subtotal - discount + tax
    const paymentMethod = pick(methods)
    const status = rand() > 0.92 ? "voided" : "completed"
    list.push({
      id: `TXN-${2000 + i}`,
      customerName: name,
      items,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
      amountTendered: paymentMethod === "cash" ? Math.ceil((total + rand() * 200) / 50) * 50 : undefined,
      change: paymentMethod === "cash" ? undefined : undefined,
      cashier: pick(cashiers),
      businessUnitId,
      status,
      voidReason: status === "voided" ? "Customer requested cancellation" : undefined,
      createdAt: daysAgo(Math.floor(rand() * 10)),
    })
  }
  return list.map((sale) => ({
    ...sale,
    change: sale.amountTendered ? Math.max(sale.amountTendered - sale.total, 0) : undefined,
  }))
}

export function generateNotifications(): NotificationLogEntry[] {
  const list: NotificationLogEntry[] = []
  const channelsPool: NotificationLogEntry["channels"][] = [["sms"], ["email"], ["in-app"], ["sms", "email"]]
  const statusPool: NotificationLogEntry["status"][] = ["sent", "sent", "sent", "pending", "failed"]
  const messages = [
    "Your order is ready for pickup at LA Drops Laundry!",
    "Reminder: payment for your recent order is still pending.",
    "Thank you for choosing us! We hope to see you again soon.",
    "Your scheduled pickup is coming up tomorrow.",
    "We've received your laundry and started processing it.",
  ]
  for (let i = 0; i < 12; i++) {
    const name = pick(CUSTOMER_NAMES)
    list.push({
      id: `ntf-${i + 1}`,
      recipient: name,
      message: pick(messages),
      channels: pick(channelsPool),
      status: pick(statusPool),
      businessUnitId: i % 3 === 0 ? "bu-sister" : "bu-ladrops",
      createdAt: daysAgo(Math.floor(rand() * 7)),
    })
  }
  return list
}
