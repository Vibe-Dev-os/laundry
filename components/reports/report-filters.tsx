"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ReportRange } from "@/lib/derived"

const RANGE_LABELS: Record<ReportRange, string> = {
  7: "Last 7 days",
  30: "Last 30 days",
  90: "Last 90 days",
}

interface ReportFiltersProps {
  range: ReportRange
  onRangeChange: (range: ReportRange) => void
  onExport: () => void
}

export function ReportFilters({ range, onRangeChange, onExport }: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Select value={String(range)} onValueChange={(v) => onRangeChange(Number(v) as ReportRange)}>
        <SelectTrigger className="w-[180px]" size="sm">
          <SelectValue>{() => RANGE_LABELS[range]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="90">Last 90 days</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={onExport}>
        <Download /> Export CSV
      </Button>
    </div>
  )
}
