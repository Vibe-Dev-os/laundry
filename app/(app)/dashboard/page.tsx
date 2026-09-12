"use client"

import { useMemo, useState } from "react"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart"
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart"
import { ActivityFeed, QuickActions } from "@/components/dashboard/activity-feed"
import { ReservationFormSheet } from "@/components/reservations/reservation-form-sheet"
import { useApp } from "@/lib/store"
import {
  activeReservationsCount,
  completedTodayCount,
  filterByBU,
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
  const buId = state.selectedBusinessUnitId
  const businessName =
    buId === "all" ? "All Business Units" : state.businessUnits.find((b) => b.id === buId)?.name ?? "Business"

  const reservations = useMemo(() => filterByBU(state.reservations, buId), [state.reservations, buId])
  const sales = useMemo(() => filterByBU(state.sales, buId), [state.sales, buId])
  const notifications = useMemo(() => filterByBU(state.notifications, buId), [state.notifications, buId])

  const today = todayRevenue(sales)
  const yesterday = yesterdayRevenue(sales)
  const revenueTrend = trendPercent(today, yesterday)
  const chartData = useMemo(() => last7DaysRevenue(sales), [sales])
  const breakdown = useMemo(() => reservationStatusBreakdown(reservations), [reservations])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of {businessName} —{" "}
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <KpiCards
        todayRevenue={today}
        revenueTrend={revenueTrend}
        activeReservations={activeReservationsCount(reservations)}
        pendingNotifications={pendingNotificationsCount(notifications)}
        completedToday={completedTodayCount(sales)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RevenueTrendChart data={chartData} />
        <StatusDonutChart breakdown={breakdown} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed reservations={reservations} sales={sales} />
        </div>
        <QuickActions onNewReservation={() => setSheetOpen(true)} />
      </div>

      <ReservationFormSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
