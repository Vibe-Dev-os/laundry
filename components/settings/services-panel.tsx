"use client"

import * as React from "react"
import { PenLine, Plus, Shirt, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/derived"
import { canManageSettings } from "@/lib/roles"
import { useApp } from "@/lib/store"
import type { ServiceKey, ServicePricing } from "@/lib/types"
import { SERVICE_LABELS } from "@/lib/types"

const SERVICE_KEYS = Object.keys(SERVICE_LABELS) as ServiceKey[]

export function ServicesPanel({ businessUnitId }: { businessUnitId: string }) {
  const { state, dispatch } = useApp()
  const role = state.currentUser?.role ?? "customer"
  const canManage = canManageSettings(role)

  const services =
    businessUnitId === "all" ? state.services : state.services.filter((s) => s.businessUnitId === businessUnitId)

  const [editing, setEditing] = React.useState<ServicePricing | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<ServicePricing | null>(null)
  const [name, setName] = React.useState("")
  const [key, setKey] = React.useState<ServiceKey>("wash-fold")
  const [unit, setUnit] = React.useState<"per-kilo" | "per-load">("per-kilo")
  const [price, setPrice] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function openNew() {
    setEditing(null)
    setName("")
    setKey("wash-fold")
    setUnit("per-kilo")
    setPrice("")
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(svc: ServicePricing) {
    setEditing(svc)
    setName(svc.name)
    setKey(svc.key)
    setUnit(svc.unit)
    setPrice(String(svc.price))
    setErrors({})
    setFormOpen(true)
  }

  function handleSave() {
    const nextErrors: Record<string, string> = {}
    const priceNum = Number(price)
    if (!name.trim()) nextErrors.name = "Service name is required."
    if (!price.trim() || Number.isNaN(priceNum) || priceNum <= 0) nextErrors.price = "Enter a valid price."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const targetBU = businessUnitId === "all" ? state.businessUnits[0]?.id ?? "bu-1" : businessUnitId

    if (editing) {
      dispatch({
        type: "UPDATE_SERVICE",
        id: editing.id,
        patch: { name: name.trim(), key, unit, price: priceNum },
      })
      toast.success("Service updated", { description: `"${name.trim()}" was saved.` })
    } else {
      dispatch({
        type: "ADD_SERVICE",
        service: { id: `svc-${Date.now()}`, name: name.trim(), key, unit, price: priceNum, businessUnitId: targetBU },
      })
      toast.success("Service added", { description: `"${name.trim()}" was added.` })
    }
    setFormOpen(false)
  }

  function handleDelete() {
    if (!deleteTarget) return
    dispatch({ type: "DELETE_SERVICE", id: deleteTarget.id })
    toast.success("Service removed", { description: `"${deleteTarget.name}" was deleted.` })
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Pricing for services offered at the selected branch.</p>
        {canManage && (
          <Button onClick={openNew} size="sm">
            <Plus data-icon="inline-start" />
            Add Service
          </Button>
        )}
      </div>

      {services.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Shirt />
          </EmptyMedia>
          <EmptyTitle>No services yet</EmptyTitle>
          <EmptyDescription>Add a service to start pricing orders for this branch.</EmptyDescription>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Price</TableHead>
              {canManage && <TableHead className="w-20" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((svc) => (
              <TableRow key={svc.id}>
                <TableCell className="font-medium">{svc.name}</TableCell>
                <TableCell className="text-muted-foreground">{SERVICE_LABELS[svc.key]}</TableCell>
                <TableCell className="text-muted-foreground">
                  {svc.unit === "per-kilo" ? "Per kilo" : "Per load"}
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(svc.price)}</TableCell>
                {canManage && (
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(svc)}>
                        <PenLine className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(svc)}>
                        <Trash2 className="text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>Set the name, category, unit, and price for this service.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="svc-name">Service Name</FieldLabel>
              <Input id="svc-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select value={key} onValueChange={(v) => setKey(v as ServiceKey)}>
                <SelectTrigger>
                  <SelectValue>{() => SERVICE_LABELS[key]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {SERVICE_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Unit</FieldLabel>
              <Select value={unit} onValueChange={(v) => setUnit(v as "per-kilo" | "per-load")}>
                <SelectTrigger>
                  <SelectValue>{() => (unit === "per-kilo" ? "Per kilo" : "Per load")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-kilo">Per kilo</SelectItem>
                  <SelectItem value="per-load">Per load</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!errors.price || undefined}>
              <FieldLabel htmlFor="svc-price">Price (PHP)</FieldLabel>
              <Input
                id="svc-price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={!!errors.price}
              />
              {errors.price && <FieldError>{errors.price}</FieldError>}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? "Save Changes" : "Add Service"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Service</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.name}&quot; from the price list. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
