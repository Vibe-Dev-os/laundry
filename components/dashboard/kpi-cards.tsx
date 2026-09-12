"use client"

import { Bell, CalendarClock, CheckCircle2, TrendingDown, TrendingUp, Wallet } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/derived"
import { cn } from "@/lib/utils"

interface KpiCardsProps {
  todayRevenue: number
  revenueTrend: number
  activeReservations: number
  pendingNotifications: number
  completedToday: number
}

export function KpiCards({
  todayRevenue,
  revenueTrend,
  activeReservations,
  pendingNotifications,
  completedToday,
}: KpiCardsProps) {
  const cards = [
    {
      label: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      icon: Wallet,
      trend: revenueTrend,
      showTrend: true,
    },
    {
      label: "Active Reservations",
      value: String(activeReservations),
      icon: CalendarClock,
      showTrend: false,
    },
    {
      label: "Pending Notifications",
      value: String(pendingNotifications),
      icon: Bell,
      showTrend: false,
    },
    {
      label: "Completed Orders Today",
      value: String(completedToday),
      icon: CheckCircle2,
      showTrend: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <card.icon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{card.value}</div>
            {card.showTrend && (
              <p
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs font-medium",
                  card.trend >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {card.trend >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                {Math.abs(card.trend)}% vs yesterday
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
