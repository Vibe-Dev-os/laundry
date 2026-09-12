"use client"

import * as React from "react"
import { FileText, PenLine, Plus, Trash2 } from "lucide-react"
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
import { Card } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { canManageSettings } from "@/lib/roles"
import { useApp } from "@/lib/store"
import type { MessageTemplate } from "@/lib/types"

export function TemplatesPanel() {
  const { state, dispatch } = useApp()
  const role = state.currentUser?.role ?? "customer"
  const canManage = canManageSettings(role)

  const [editing, setEditing] = React.useState<MessageTemplate | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<MessageTemplate | null>(null)
  const [name, setName] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function openNew() {
    setEditing(null)
    setName("")
    setMessage("")
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(tpl: MessageTemplate) {
    setEditing(tpl)
    setName(tpl.name)
    setMessage(tpl.message)
    setErrors({})
    setFormOpen(true)
  }

  function handleSave() {
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = "Template name is required."
    if (!message.trim()) nextErrors.message = "Message is required."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (editing) {
      dispatch({ type: "UPDATE_TEMPLATE", id: editing.id, patch: { name: name.trim(), message: message.trim() } })
      toast.success("Template updated", { description: `"${name.trim()}" was saved.` })
    } else {
      dispatch({
        type: "ADD_TEMPLATE",
        template: { id: `tpl-${Date.now()}`, name: name.trim(), message: message.trim() },
      })
      toast.success("Template created", { description: `"${name.trim()}" was added.` })
    }
    setFormOpen(false)
  }

  function handleDelete() {
    if (!deleteTarget) return
    dispatch({ type: "DELETE_TEMPLATE", id: deleteTarget.id })
    toast.success("Template deleted", { description: `"${deleteTarget.name}" was removed.` })
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Reusable messages for common customer notifications.</p>
        {canManage && (
          <Button onClick={openNew} size="sm">
            <Plus data-icon="inline-start" />
            New Template
          </Button>
        )}
      </div>

      {state.templates.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>No templates yet</EmptyTitle>
          <EmptyDescription>Create a template to speed up sending common messages.</EmptyDescription>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {state.templates.map((tpl) => (
            <Card key={tpl.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium">{tpl.name}</span>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(tpl)}>
                      <PenLine className="text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(tpl)}>
                      <Trash2 className="text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">{tpl.message}</p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Template" : "New Template"}</DialogTitle>
            <DialogDescription>
              Use <span className="font-mono text-xs">{"{name}"}</span> as a placeholder for the recipient&apos;s name.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="tpl-name">Template Name</FieldLabel>
              <Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.message || undefined}>
              <FieldLabel htmlFor="tpl-message">Message</FieldLabel>
              <Textarea
                id="tpl-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                aria-invalid={!!errors.message}
              />
              {errors.message && <FieldError>{errors.message}</FieldError>}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? "Save Changes" : "Create Template"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
