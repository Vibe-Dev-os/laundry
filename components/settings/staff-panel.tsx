"use client"

import * as React from "react"
import { Plus, Users } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { canManageSettings } from "@/lib/roles"
import { ROLE_LABELS, useApp } from "@/lib/store"
import type { Role } from "@/lib/types"

const ASSIGNABLE_ROLES: Role[] = ["staff"]

export function StaffPanel({ businessUnitId }: { businessUnitId: string }) {
  const { state, dispatch } = useApp()
  const role = state.currentUser?.role ?? "customer"
  const canManage = canManageSettings(role)

  const staff = businessUnitId === "all" ? state.staff : state.staff.filter((s) => s.businessUnitId === businessUnitId)

  const [formOpen, setFormOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [staffRole, setStaffRole] = React.useState<Role>("staff")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function openNew() {
    setName("")
    setEmail("")
    setStaffRole("staff")
    setErrors({})
    setFormOpen(true)
  }

  function handleSave() {
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = "Name is required."
    if (!email.trim() || !email.includes("@")) nextErrors.email = "Enter a valid email address."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const targetBU = businessUnitId === "all" ? state.businessUnits[0]?.id ?? "bu-1" : businessUnitId
    const initials = name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

    dispatch({
      type: "ADD_STAFF",
      staff: {
        id: `staff-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role: staffRole,
        businessUnitId: targetBU,
        active: true,
        transactionsHandled: 0,
        salesProcessed: 0,
        voidedTransactions: 0,
        initials,
      },
    })
    toast.success("Staff member added", { description: `"${name.trim()}" was added to the team.` })
    setFormOpen(false)
  }

  function handleToggleActive(id: string, nextActive: boolean, memberName: string) {
    dispatch({ type: "TOGGLE_STAFF_ACTIVE", id })
    toast.success(nextActive ? "Staff member activated" : "Staff member deactivated", {
      description: `${memberName} is now ${nextActive ? "active" : "inactive"}.`,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage team members and their access for this branch.</p>
        {canManage && (
          <Button onClick={openNew} size="sm">
            <Plus data-icon="inline-start" />
            Add Staff
          </Button>
        )}
      </div>

      {staff.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>No staff yet</EmptyTitle>
          <EmptyDescription>Add a team member to get started.</EmptyDescription>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="w-24 text-right">Active</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{member.name}</span>
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{ROLE_LABELS[member.role]}</TableCell>
                <TableCell>
                  <Badge variant={member.active ? "secondary" : "outline"}>
                    {member.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <Switch
                      checked={member.active}
                      onCheckedChange={(checked) => handleToggleActive(member.id, checked, member.name)}
                    />
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
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Invite a new team member to this branch.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="staff-name">Full Name</FieldLabel>
              <Input
                id="staff-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="staff-email">Email Address</FieldLabel>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select value={staffRole} onValueChange={(v) => setStaffRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue>{() => ROLE_LABELS[staffRole]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Add Staff Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
