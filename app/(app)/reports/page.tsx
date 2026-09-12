"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportSummaryCards } from "@/components/reports/report-summary-cards"
import { RevenueByServiceChart } from "@/components/reports/revenue-by-service-chart"
import { StaffPerformanceTable } from "@/components/reports/staff-performance-table"
import { TopCustomersTable } from "@/components/reports/top-customers-table"
import { RequireRole } from "@/components/app-shell/require-role"
import { useApp } from "@/lib/store"
import {
  filterByBU,
  revenueByRange,
  revenueByService,
  salesInRange,
  staffPerformance,
  summaryTotals,
  toCsv,
  topCustomers,
  type ReportRange,
} from "@/lib/derived"

export default function ReportsPage() {
  const { state } = useApp()
  const [range, setRange] = useState<ReportRange>(30)
  const buId = state.selectedBusinessUnitId

  const sales = useMemo(() => filterByBU(state.sales, buId), [state.sales, buId])
  const staff = useMemo(() => filterByBU(state.staff, buId), [state.staff, buId])
  const rangedSales = useMemo(() => salesInRange(sales, range), [sales, range])

  const chartData = useMemo(() => revenueByRange(sales, range), [sales, range])
  const serviceData = useMemo(() => revenueByService(rangedSales), [rangedSales])
  const customers = useMemo(() => topCustomers(rangedSales), [rangedSales])
  const staffRanked = useMemo(() => staffPerformance(staff), [staff])
  const totals = useMemo(() => summaryTotals(rangedSales), [rangedSales])

  function handleExport() {
    const csv = toCsv(rangedSales)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `sales-report-${range}d.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast("Report exported", { description: `${rangedSales.length} transactions exported to CSV.` })
  }

  return (
    <RequireRole navKey="reports">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Sales performance, top customers, and staff activity.</p>
        </div>

        <ReportFilters range={range} onRangeChange={setRange} onExport={handleExport} />

        <ReportSummaryCards
          revenue={totals.revenue}
          orders={totals.orders}
          avgOrderValue={totals.avgOrderValue}
          voided={totals.voided}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RevenueTrendChart data={chartData} description={`Last ${range} days across selected business unit(s)`} />
          <RevenueByServiceChart data={serviceData} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopCustomersTable customers={customers} />
          <StaffPerformanceTable staff={staffRanked} />
        </div>
      </div>
    </RequireRole>
  )
}
