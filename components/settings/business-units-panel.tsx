"use client"

import * as React from "react"
import { Building2, PenLine, Share2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useApp } from "@/lib/store"
import type { BusinessUnit } from "@/lib/types"

export function BusinessUnitsPanel() {
  const { state, dispatch } = useApp()
  const role = state.currentUser?.role ?? "customer"
  const isOwner = role === "owner"

  const [editing, setEditing] = React.useState<BusinessUnit | null>(null)
  const [name, setName] = React.useState("")
  const [contact, setContact] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function openEdit(bu: BusinessUnit) {
    setEditing(bu)
    setName(bu.name)
    setContact(bu.contact)
    setAddress(bu.address)
    setErrors({})
  }

  function handleSave() {
    if (!editing) return
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = "Branch name is required."
    if (!contact.trim()) nextErrors.contact = "Contact number is required."
    if (!address.trim()) nextErrors.address = "Address is required."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    dispatch({
      type: "UPDATE_BUSINESS_UNIT",
      id: editing.id,
      patch: { name: name.trim(), contact: contact.trim(), address: address.trim() },
    })
    toast.success("Branch updated", { description: `"${name.trim()}" was saved.` })
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Manage your laundry branches and whether they share a common customer database.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {state.businessUnits.map((bu) => (
          <Card key={bu.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{bu.name}</span>
                  <span className="text-sm text-muted-foreground">{bu.address}</span>
                  <span className="text-xs text-muted-foreground">{bu.contact}</span>
                </div>
              </div>
              {isOwner && (
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(bu)}>
                  <PenLine className="text-muted-foreground" />
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
              <div className="flex items-center gap-2">
                <Share2 className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Shares customer database</span>
              </div>
              <div className="flex items-center gap-2">
                {bu.shareCustomerDb && (
                  <Badge variant="secondary" className="text-xs">
                    Shared
                  </Badge>
                )}
                <Switch
                  checked={bu.shareCustomerDb}
                  onCheckedChange={() => dispatch({ type: "TOGGLE_SHARE_DB", id: bu.id })}
                  disabled={!isOwner}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!isOwner && <p className="text-xs text-muted-foreground">Only the owner can edit branch details.</p>}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update the branch name, contact number, and address.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="bu-name">Branch Name</FieldLabel>
              <Input id="bu-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.contact || undefined}>
              <FieldLabel htmlFor="bu-contact">Contact Number</FieldLabel>
              <Input
                id="bu-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                aria-invalid={!!errors.contact}
              />
              {errors.contact && <FieldError>{errors.contact}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.address || undefined}>
              <FieldLabel htmlFor="bu-address">Address</FieldLabel>
              <Input
                id="bu-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-invalid={!!errors.address}
              />
              {errors.address && <FieldError>{errors.address}</FieldError>}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
