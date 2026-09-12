"use client"

import { Cell, Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { STATUS_LABELS } from "@/lib/types"

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--chart-1)",
  received: "var(--chart-2)",
  washing: "var(--chart-3)",
  drying: "var(--chart-4)",
  ready: "var(--success)",
  claimed: "var(--muted-foreground)",
}

const chartConfig: ChartConfig = Object.fromEntries(
  Object.entries(STATUS_LABELS)
    .filter(([key]) => key !== "cancelled")
    .map(([key, label]) => [key, { label, color: STATUS_COLORS[key] }])
)

export function StatusDonutChart({ breakdown }: { breakdown: Record<string, number> }) {
  const data = Object.entries(breakdown).map(([status, count]) => ({
    status,
    count,
    fill: STATUS_COLORS[status],
  }))
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Breakdown</CardTitle>
        <CardDescription>{total} active/recent orders</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[240px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} strokeWidth={4}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          {data.map((d) => (
            <div key={d.status} className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: d.fill }} />
              <span className="text-muted-foreground">
                {STATUS_LABELS[d.status as keyof typeof STATUS_LABELS]} ({d.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
