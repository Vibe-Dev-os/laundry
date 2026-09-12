"use client"

import { useMemo, useState } from "react"
import { CalendarPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ReservationFormSheet } from "@/components/reservations/reservation-form-sheet"
import { ReservationsTable } from "@/components/reservations/reservations-table"
import { filterByBU } from "@/lib/derived"
import { canCreate } from "@/lib/roles"
import { useApp } from "@/lib/store"

export default function ReservationsPage() {
  const { state } = useApp()
  const [sheetOpen, setSheetOpen] = useState(false)
  const role = state.currentUser?.role ?? "customer"
  const reservations = useMemo(
    () => filterByBU(state.reservations, state.selectedBusinessUnitId),
    [state.reservations, state.selectedBusinessUnitId]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reservations</h1>
          <p className="text-sm text-muted-foreground">Manage pickups, drop-offs, and order status.</p>
        </div>
        {canCreate(role) && (
          <Button onClick={() => setSheetOpen(true)}>
            <CalendarPlus data-icon="inline-start" />
            New Reservation
          </Button>
        )}
      </div>

      <ReservationsTable reservations={reservations} />
      <ReservationFormSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
