"use client"

import * as React from "react"
import { MoreHorizontal, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { ReservationStatusDialog } from "@/components/reservations/reservation-status-dialog"
import { formatDateTime } from "@/lib/derived"
import { useApp } from "@/lib/store"
import { canCreate, canDelete } from "@/lib/roles"
import { SERVICE_LABELS, STATUS_LABELS, STATUS_ORDER, type Reservation, type ReservationStatus } from "@/lib/types"

export function ReservationsTable({ reservations }: { reservations: Reservation[] }) {
  const { state, dispatch } = useApp()
  const role = state.currentUser?.role ?? "customer"
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<ReservationStatus | "all">("all")
  const [editing, setEditing] = React.useState<Reservation | null>(null)
  const [deleting, setDeleting] = React.useState<Reservation | null>(null)

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      !search.trim() ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.contact.includes(search)
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function handleDelete() {
    if (!deleting) return
    dispatch({ type: "DELETE_RESERVATION", id: deleting.id })
    toast.success("Reservation deleted", { description: `${deleting.customerName}'s reservation was removed.` })
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by name or contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReservationStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue>
              {() => (statusFilter === "all" ? "All Statuses" : STATUS_LABELS[statusFilter])}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Statuses</SelectItem>
              {[...STATUS_ORDER, "cancelled" as ReservationStatus].map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Search />
          </EmptyMedia>
          <EmptyTitle>No reservations found</EmptyTitle>
          <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Kilos</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                {(canCreate(role) || canDelete(role)) && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{r.customerName}</span>
                      <span className="text-xs text-muted-foreground">{r.contact}</span>
                    </div>
                  </TableCell>
                  <TableCell>{SERVICE_LABELS[r.serviceKey]}</TableCell>
                  <TableCell>{r.kilos} kg</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDateTime(r.scheduledAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  {(canCreate(role) || canDelete(role)) && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                          <MoreHorizontal />
                          <span className="sr-only">Actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            {canCreate(role) && (
                              <DropdownMenuItem onClick={() => setEditing(r)}>Update Status</DropdownMenuItem>
                            )}
                            {canDelete(role) && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleting(r)}
                              >
                                <Trash2 data-icon="inline-start" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}


      <ReservationStatusDialog reservation={editing} onOpenChange={(open) => !open && setEditing(null)} />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this reservation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleting?.customerName}&apos;s reservation. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
