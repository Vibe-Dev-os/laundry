"use client"

import { CalendarClock, CalendarPlus, ShoppingCart, ClipboardPlus, Bell } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { StatusBadge } from "@/components/status-badge"
import { formatDateTime } from "@/lib/derived"
import { SERVICE_LABELS, type Reservation, type Sale } from "@/lib/types"

interface ActivityItem {
  id: string
  type: "reservation" | "sale"
  title: string
  subtitle: string
  timestamp: string
  status: string
}

export function ActivityFeed({ reservations, sales }: { reservations: Reservation[]; sales: Sale[] }) {
  const items: ActivityItem[] = [
    ...reservations.slice(0, 8).map((r) => ({
      id: r.id,
      type: "reservation" as const,
      title: r.customerName,
      subtitle: SERVICE_LABELS[r.serviceKey],
      timestamp: r.createdAt,
      status: r.status,
    })),
    ...sales.slice(0, 8).map((s) => ({
      id: s.id,
      type: "sale" as const,
      title: s.customerName,
      subtitle: `Transaction ${s.id}`,
      timestamp: s.createdAt,
      status: s.status,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest reservations and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>No activity yet</EmptyTitle>
            <EmptyDescription>New reservations and sales will show up here.</EmptyDescription>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={`${item.type}-${item.id}`} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  {item.type === "reservation" ? (
                    <CalendarClock className="size-4 text-primary" />
                  ) : (
                    <ShoppingCart className="size-4 text-accent" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{item.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>
                    <StatusBadge status={item.status} className="shrink-0" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function QuickActions({ onNewReservation }: { onNewReservation: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump into common tasks</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button onClick={onNewReservation} className="justify-start">
          <CalendarPlus data-icon="inline-start" />
          New Reservation
        </Button>
        <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/sales" />}>
          <ClipboardPlus data-icon="inline-start" />
          New Sale
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          nativeButton={false}
          render={<Link href="/notifications" />}
        >
          <Bell data-icon="inline-start" />
          View Notifications
        </Button>
      </CardContent>
    </Card>
  )
}
