"use client"

import { Ban, CircleDollarSign, Receipt, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/derived"

interface ReportSummaryCardsProps {
  revenue: number
  orders: number
  avgOrderValue: number
  voided: number
}

export function ReportSummaryCards({ revenue, orders, avgOrderValue, voided }: ReportSummaryCardsProps) {
  const cards = [
    { label: "Total Revenue", value: formatCurrency(revenue), icon: CircleDollarSign },
    { label: "Completed Orders", value: String(orders), icon: Receipt },
    { label: "Average Order Value", value: formatCurrency(avgOrderValue), icon: TrendingUp },
    { label: "Voided Transactions", value: String(voided), icon: Ban },
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
