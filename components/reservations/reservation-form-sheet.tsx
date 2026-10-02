"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/store"
import { SERVICE_LABELS, type ServiceKey } from "@/lib/types"

interface ReservationFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SERVICE_KEYS: ServiceKey[] = ["wash-fold", "wash-iron", "dry-clean", "comforter"]

export function ReservationFormSheet({ open, onOpenChange }: ReservationFormSheetProps) {
  const { state, dispatch } = useApp()
  const isCustomer = state.currentUser?.role === "customer"
  const [name, setName] = React.useState(isCustomer ? state.currentUser?.name ?? "" : "")
  const [contact, setContact] = React.useState("")
  const [email, setEmail] = React.useState(isCustomer ? state.currentUser?.email ?? "" : "")
  const [serviceKey, setServiceKey] = React.useState<ServiceKey>("wash-fold")
  const [kilos, setKilos] = React.useState("5")
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState("09:00")
  const [notes, setNotes] = React.useState("")
  const [businessUnitId, setBusinessUnitId] = React.useState(
    isCustomer
      ? state.currentUser?.businessUnitId ?? ""
      : state.selectedBusinessUnitId !== "all"
        ? state.selectedBusinessUnitId
        : (state.businessUnits[0]?.id ?? "")
  )
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)

  // Re-sync the default business unit each time the sheet opens, since it stays mounted
  // and the selected filter or loaded business units can change after initial mount.
  React.useEffect(() => {
    if (!open) return
    if (isCustomer) {
      setName(state.currentUser?.name ?? "")
      setEmail(state.currentUser?.email ?? "")
      setBusinessUnitId(state.currentUser?.businessUnitId ?? "")
      return
    }
    setBusinessUnitId((current) =>
      current ? current : state.selectedBusinessUnitId !== "all" ? state.selectedBusinessUnitId : (state.businessUnits[0]?.id ?? "")
    )
  }, [open, isCustomer, state.currentUser, state.selectedBusinessUnitId, state.businessUnits])

  function reset() {
    setName("")
    setContact("")
    setEmail("")
    setServiceKey("wash-fold")
    setKilos("5")
    setDate(undefined)
    setTime("09:00")
    setNotes("")
    setErrors({})
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = "Customer name is required."
    if (!contact.trim()) nextErrors.contact = "Contact number is required."
    if (email && !/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address."
    if (!kilos || Number(kilos) <= 0) nextErrors.kilos = "Enter a valid estimate."
    if (!businessUnitId) nextErrors.businessUnit = "Business unit data is still loading. Please try again."
    if (!date) nextErrors.date = "Pick a preferred date."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const scheduled = new Date(date!)
    const [hh, mm] = time.split(":").map(Number)
    scheduled.setHours(hh ?? 9, mm ?? 0, 0, 0)

    window.setTimeout(() => {
      dispatch({
        type: "ADD_RESERVATION",
        reservation: {
          id: `res-${Date.now()}`,
          customerName: name.trim(),
          contact: contact.trim(),
          email: email.trim(),
          serviceKey,
          kilos: Number(kilos),
          scheduledAt: scheduled.toISOString(),
          status: "pending",
          businessUnitId,
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString(),
        },
      })
      setSubmitting(false)
      toast.success("Reservation created", { description: `${name.trim()} was added with status Pending.` })
      reset()
      onOpenChange(false)
    }, 500)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Reservation</DialogTitle>
          <DialogDescription>Schedule a new laundry pickup or drop-off for a customer.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="customer-name">Customer Name</FieldLabel>
              <Input
                id="customer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                placeholder="Juan Dela Cruz"
                disabled={isCustomer}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.contact || undefined}>
              <FieldLabel htmlFor="contact">Contact Number</FieldLabel>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                aria-invalid={!!errors.contact}
                placeholder="0917 123 4567"
              />
              {errors.contact && <FieldError>{errors.contact}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="email">Email (optional)</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                placeholder="juan@email.com"
                disabled={isCustomer}
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.businessUnit || undefined}>
              <FieldLabel htmlFor="business-unit">Business Unit</FieldLabel>
              <Select value={businessUnitId} onValueChange={setBusinessUnitId} disabled={isCustomer}>
                <SelectTrigger id="business-unit" className="w-full">
                  <SelectValue>
                    {() => state.businessUnits.find((bu) => bu.id === businessUnitId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {state.businessUnits.map((bu) => (
                      <SelectItem key={bu.id} value={bu.id}>
                        {bu.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.businessUnit && <FieldError>{errors.businessUnit}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="service-type">Service Type</FieldLabel>
              <Select value={serviceKey} onValueChange={(v) => setServiceKey(v as ServiceKey)}>
                <SelectTrigger id="service-type" className="w-full">
                  <SelectValue>{() => SERVICE_LABELS[serviceKey]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SERVICE_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {SERVICE_LABELS[key]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!errors.kilos || undefined}>
              <FieldLabel htmlFor="kilos">Estimated Kilos / Load</FieldLabel>
              <Input
                id="kilos"
                type="number"
                min="0"
                step="0.5"
                value={kilos}
                onChange={(e) => setKilos(e.target.value)}
                aria-invalid={!!errors.kilos}
              />
              {errors.kilos && <FieldError>{errors.kilos}</FieldError>}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.date || undefined}>
                <FieldLabel htmlFor="date">Preferred Date</FieldLabel>
                <Popover>
                  <PopoverTrigger
                    render={<Button id="date" variant="outline" className="justify-start font-normal" />}
                  >
                    <CalendarIcon data-icon="inline-start" />
                    {date ? date.toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "Select date"}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />
                  </PopoverContent>
                </Popover>
                {errors.date && <FieldError>{errors.date}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="time">Preferred Time</FieldLabel>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions…"
                rows={3}
              />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter className="flex-row justify-end gap-2">
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : "Create Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
