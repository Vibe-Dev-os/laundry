"use client"

import { useMemo, useState } from "react"
import { Bell, CalendarClock, CheckCircle2, PackageCheck, Wallet } from "lucide-react"
import { KpiCards, type KpiCardData } from "@/components/dashboard/kpi-cards"
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart"
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart"
import { ActivityFeed, QuickActions } from "@/components/dashboard/activity-feed"
import { ReservationFormSheet } from "@/components/reservations/reservation-form-sheet"
import { useApp } from "@/lib/store"
import {
  activeReservationsCount,
  completedTodayCount,
  filterByBU,
  formatCurrency,
  last7DaysRevenue,
  pendingNotificationsCount,
  reservationStatusBreakdown,
  todayRevenue,
  trendPercent,
  yesterdayRevenue,
} from "@/lib/derived"

export default function DashboardPage() {
  const { state } = useApp()
  const [sheetOpen, setSheetOpen] = useState(false)
  const isCustomer = state.currentUser?.role === "customer"
  const buId = state.selectedBusinessUnitId
  const businessName =
    buId === "all" ? "All Business Units" : state.businessUnits.find((b) => b.id === buId)?.name ?? "Business"

  const buReservations = useMemo(() => filterByBU(state.reservations, buId), [state.reservations, buId])
  const buSales = useMemo(() => filterByBU(state.sales, buId), [state.sales, buId])
  const buNotifications = useMemo(() => filterByBU(state.notifications, buId), [state.notifications, buId])

  // Customers may only see their own reservations/orders, never other customers' or business-wide data.
  const email = state.currentUser?.email.toLowerCase()
  const name = state.currentUser?.name
  const reservations = useMemo(
    () => (isCustomer ? buReservations.filter((r) => r.email.toLowerCase() === email) : buReservations),
    [isCustomer, buReservations, email]
  )
  const sales = useMemo(
    () => (isCustomer ? buSales.filter((s) => s.customerName === name) : buSales),
    [isCustomer, buSales, name]
  )

  const today = todayRevenue(sales)
  const yesterday = yesterdayRevenue(sales)
  const revenueTrend = trendPercent(today, yesterday)
  const chartData = useMemo(() => last7DaysRevenue(sales), [sales])
  const breakdown = useMemo(() => reservationStatusBreakdown(reservations), [reservations])

  const cards: KpiCardData[] = isCustomer
    ? [
        {
          label: "My Active Reservations",
          value: String(activeReservationsCount(reservations)),
          icon: CalendarClock,
        },
        {
          label: "Ready for Pickup",
          value: String(reservations.filter((r) => r.status === "ready").length),
          icon: PackageCheck,
        },
        {
          label: "Completed Orders",
          value: String(reservations.filter((r) => r.status === "claimed").length),
          icon: CheckCircle2,
        },
      ]
    : [
        { label: "Today's Revenue", value: formatCurrency(today), icon: Wallet, trend: revenueTrend },
        { label: "Active Reservations", value: String(activeReservationsCount(reservations)), icon: CalendarClock },
        {
          label: "Pending Notifications",
          value: String(pendingNotificationsCount(buNotifications)),
          icon: Bell,
        },
        { label: "Completed Orders Today", value: String(completedTodayCount(sales)), icon: CheckCircle2 },
      ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {isCustomer ? "Your orders" : `Overview of ${businessName}`} —{" "}
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <KpiCards cards={cards} />

      <div className={isCustomer ? "grid grid-cols-1 gap-6" : "grid grid-cols-1 gap-6 lg:grid-cols-3"}>
        {!isCustomer && <RevenueTrendChart data={chartData} />}
        <StatusDonutChart breakdown={breakdown} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={isCustomer ? "lg:col-span-3" : "lg:col-span-2"}>
          <ActivityFeed reservations={reservations} sales={sales} />
        </div>
        {!isCustomer && <QuickActions onNewReservation={() => setSheetOpen(true)} />}
      </div>

      <ReservationFormSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
