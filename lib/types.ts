export type Role = "owner" | "admin" | "staff" | "customer"

export type ServiceKey = "wash-fold" | "wash-iron" | "dry-clean" | "comforter"

export type ReservationStatus =
  | "pending"
  | "received"
  | "washing"
  | "drying"
  | "ready"
  | "claimed"
  | "cancelled"

export type PaymentMethod = "cash" | "gcash" | "card"

export type NotificationChannel = "sms" | "email" | "in-app"

export type NotificationStatus = "sent" | "failed" | "pending"

export interface BusinessUnit {
  id: string
  name: string
  contact: string
  address: string
  shareCustomerDb: boolean
}

export interface StaffMember {
  id: string
  name: string
  email: string
  role: Role
  businessUnitId: string
  active: boolean
  transactionsHandled: number
  salesProcessed: number
  voidedTransactions: number
  initials: string
}

export interface ServicePricing {
  id: string
  name: string
  key: ServiceKey
  unit: "per-kilo" | "per-load"
  price: number
  businessUnitId: string
}

export interface Reservation {
  id: string
  customerName: string
  contact: string
  email: string
  serviceKey: ServiceKey
  kilos: number
  scheduledAt: string // ISO
  status: ReservationStatus
  businessUnitId: string
  notes?: string
  createdAt: string
}

export interface SaleLineItem {
  serviceKey: ServiceKey
  name: string
  unitPrice: number
  qty: number
  lineTotal: number
}

export interface Sale {
  id: string
  customerName: string
  reservationId?: string
  items: SaleLineItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  amountTendered?: number
  change?: number
  cashier: string
  businessUnitId: string
  status: "completed" | "voided"
  voidReason?: string
  createdAt: string
}

export interface NotificationLogEntry {
  id: string
  recipient: string
  message: string
  channels: NotificationChannel[]
  status: NotificationStatus
  businessUnitId: string
  createdAt: string
}

export interface MessageTemplate {
  id: string
  name: string
  message: string
}

export interface CurrentUser {
  name: string
  email: string
  role: Role
  businessUnitId: string
  initials: string
}

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  "wash-fold": "Wash & Fold",
  "wash-iron": "Wash & Iron",
  "dry-clean": "Dry Clean",
  comforter: "Comforter / Bulky",
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pending",
  received: "Received",
  washing: "Washing",
  drying: "Drying",
  ready: "Ready",
  claimed: "Claimed",
  cancelled: "Cancelled",
}

export const STATUS_ORDER: ReservationStatus[] = [
  "pending",
  "received",
  "washing",
  "drying",
  "ready",
  "claimed",
]
