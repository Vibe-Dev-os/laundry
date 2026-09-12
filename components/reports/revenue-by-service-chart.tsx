"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/derived"

const chartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-2)",
  },
}

interface RevenueByServiceChartProps {
  data: { serviceKey: string; name: string; revenue: number }[]
}

export function RevenueByServiceChart({ data }: RevenueByServiceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Service</CardTitle>
        <CardDescription>Breakdown of completed sales by service type</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            No completed sales in this period.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
            <BarChart data={data} margin={{ left: 4, right: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} indicator="line" />}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
