"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { useApp } from "@/lib/store"
import { STATUS_LABELS, STATUS_ORDER, type Reservation, type ReservationStatus } from "@/lib/types"

interface ReservationStatusDialogProps {
  reservation: Reservation | null
  onOpenChange: (open: boolean) => void
}

export function ReservationStatusDialog({ reservation, onOpenChange }: ReservationStatusDialogProps) {
  const { dispatch } = useApp()
  const [status, setStatus] = React.useState<ReservationStatus>(reservation?.status ?? "pending")

  React.useEffect(() => {
    if (reservation) setStatus(reservation.status)
  }, [reservation])

  function handleSave() {
    if (!reservation) return
    dispatch({ type: "SET_RESERVATION_STATUS", id: reservation.id, status })
    toast.success("Status updated", {
      description: `${reservation.customerName} is now marked as ${STATUS_LABELS[status]}.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={!!reservation} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            {reservation?.customerName} — currently{" "}
            {reservation && <StatusBadge status={reservation.status} />}
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="new-status">New Status</FieldLabel>
          <Select value={status} onValueChange={(v) => setStatus(v as ReservationStatus)}>
            <SelectTrigger id="new-status" className="w-full">
              <SelectValue>{() => STATUS_LABELS[status]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[...STATUS_ORDER, "cancelled" as ReservationStatus].map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSave}>Save Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
