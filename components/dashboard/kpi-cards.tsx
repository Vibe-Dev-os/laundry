"use client"

import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface KpiCardData {
  label: string
  value: string
  icon: LucideIcon
  trend?: number
}

export function KpiCards({ cards }: { cards: KpiCardData[] }) {
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
            {card.trend !== undefined && (
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
