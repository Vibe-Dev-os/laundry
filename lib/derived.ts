import { SERVICE_LABELS } from "./types"
import type { NotificationLogEntry, Reservation, Sale, ServiceKey, ServicePricing, StaffMember } from "./types"

export function filterByBU<T extends { businessUnitId: string }>(list: T[], businessUnitId: string): T[] {
  if (businessUnitId === "all") return list
  return list.filter((item) => item.businessUnitId === businessUnitId)
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(
    value
  )
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}

export function todayRevenue(sales: Sale[]) {
  const today = new Date()
  return sales
    .filter((s) => s.status === "completed" && isSameDay(new Date(s.createdAt), today))
    .reduce((sum, s) => sum + s.total, 0)
}

export function yesterdayRevenue(sales: Sale[]) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return sales
    .filter((s) => s.status === "completed" && isSameDay(new Date(s.createdAt), yesterday))
    .reduce((sum, s) => sum + s.total, 0)
}

export function trendPercent(today: number, yesterday: number) {
  if (yesterday === 0) return today > 0 ? 100 : 0
  return Math.round(((today - yesterday) / yesterday) * 100)
}

export function last7DaysRevenue(sales: Sale[]) {
  const days: { label: string; date: Date; revenue: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ label: d.toLocaleDateString("en-PH", { weekday: "short" }), date: d, revenue: 0 })
  }
  for (const sale of sales) {
    if (sale.status !== "completed") continue
    const saleDate = new Date(sale.createdAt)
    const match = days.find((d) => isSameDay(d.date, saleDate))
    if (match) match.revenue += sale.total
  }
  return days.map((d) => ({ day: d.label, revenue: d.revenue }))
}

export function reservationStatusBreakdown(reservations: Reservation[]) {
  const buckets: Record<string, number> = { pending: 0, received: 0, washing: 0, drying: 0, ready: 0, claimed: 0 }
  for (const r of reservations) {
    if (r.status in buckets) buckets[r.status] += 1
  }
  return buckets
}

export function activeReservationsCount(reservations: Reservation[]) {
  return reservations.filter((r) => !["claimed", "cancelled"].includes(r.status)).length
}

export function completedTodayCount(sales: Sale[]) {
  const today = new Date()
  return sales.filter((s) => s.status === "completed" && isSameDay(new Date(s.createdAt), today)).length
}

export function pendingNotificationsCount(notifications: NotificationLogEntry[]) {
  return notifications.filter((n) => n.status === "pending").length
}

export function priceFor(services: ServicePricing[], serviceKey: string, businessUnitId: string) {
  const svc = services.find((s) => s.key === serviceKey && s.businessUnitId === businessUnitId)
  return svc ?? services.find((s) => s.key === serviceKey)
}

export function topCustomers(sales: Sale[]) {
  const map = new Map<string, { name: string; total: number; orders: number }>()
  for (const s of sales) {
    if (s.status !== "completed") continue
    const existing = map.get(s.customerName) ?? { name: s.customerName, total: 0, orders: 0 }
    existing.total += s.total
    existing.orders += 1
    map.set(s.customerName, existing)
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

export function staffPerformance(staff: StaffMember[]) {
  return [...staff].sort((a, b) => b.salesProcessed - a.salesProcessed)
}

export type ReportRange = 7 | 30 | 90

export function revenueByRange(sales: Sale[], days: ReportRange) {
  const buckets: { label: string; date: Date; revenue: number; orders: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    buckets.push({
      label: d.toLocaleDateString("en-PH", days <= 7 ? { weekday: "short" } : { month: "short", day: "numeric" }),
      date: d,
      revenue: 0,
      orders: 0,
    })
  }
  for (const sale of sales) {
    if (sale.status !== "completed") continue
    const saleDate = new Date(sale.createdAt)
    const match = buckets.find((b) => isSameDay(b.date, saleDate))
    if (match) {
      match.revenue += sale.total
      match.orders += 1
    }
  }
  return buckets.map((b) => ({ day: b.label, revenue: b.revenue, orders: b.orders }))
}

export function salesInRange(sales: Sale[], days: ReportRange) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - (days - 1))
  cutoff.setHours(0, 0, 0, 0)
  return sales.filter((s) => new Date(s.createdAt) >= cutoff)
}

export function revenueByService(sales: Sale[]) {
  const totals: Record<string, number> = {}
  for (const sale of sales) {
    if (sale.status !== "completed") continue
    for (const item of sale.items) {
      totals[item.serviceKey] = (totals[item.serviceKey] ?? 0) + item.lineTotal
    }
  }
  return (Object.keys(SERVICE_LABELS) as ServiceKey[])
    .map((key) => ({ serviceKey: key, name: SERVICE_LABELS[key], revenue: totals[key] ?? 0 }))
    .filter((s) => s.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
}

export function paymentMethodBreakdown(sales: Sale[]) {
  const totals: Record<string, number> = { cash: 0, gcash: 0, card: 0 }
  for (const sale of sales) {
    if (sale.status !== "completed") continue
    totals[sale.paymentMethod] = (totals[sale.paymentMethod] ?? 0) + sale.total
  }
  return totals
}

export function summaryTotals(sales: Sale[]) {
  const completed = sales.filter((s) => s.status === "completed")
  const revenue = completed.reduce((sum, s) => sum + s.total, 0)
  const orders = completed.length
  const avgOrderValue = orders > 0 ? revenue / orders : 0
  const voided = sales.filter((s) => s.status === "voided").length
  return { revenue, orders, avgOrderValue, voided }
}

export function toCsv(sales: Sale[]) {
  const header = ["Date", "Customer", "Items", "Payment Method", "Cashier", "Status", "Total"]
  const rows = sales.map((s) => [
    formatDateTime(s.createdAt),
    s.customerName,
    s.items.map((i) => `${i.name} x${i.qty}`).join("; "),
    s.paymentMethod,
    s.cashier,
    s.status,
    s.total.toString(),
  ])
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")
}
