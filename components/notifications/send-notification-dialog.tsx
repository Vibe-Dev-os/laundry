"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/store"
import type { NotificationChannel } from "@/lib/types"

const CHANNEL_OPTIONS: { key: NotificationChannel; label: string }[] = [
  { key: "sms", label: "SMS" },
  { key: "email", label: "Email" },
  { key: "in-app", label: "In-App" },
]

interface SendNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendNotificationDialog({ open, onOpenChange }: SendNotificationDialogProps) {
  const { state, dispatch } = useApp()
  const [recipient, setRecipient] = React.useState("")
  const [templateId, setTemplateId] = React.useState<string>("custom")
  const [message, setMessage] = React.useState("")
  const [channels, setChannels] = React.useState<NotificationChannel[]>(["sms"])
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function reset() {
    setRecipient("")
    setTemplateId("custom")
    setMessage("")
    setChannels(["sms"])
    setErrors({})
  }

  function handleTemplateChange(id: string) {
    setTemplateId(id)
    if (id === "custom") return
    const tpl = state.templates.find((t) => t.id === id)
    if (tpl) setMessage(tpl.message.replace("{name}", recipient.trim() || "{name}"))
  }

  function toggleChannel(channel: NotificationChannel) {
    setChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]))
  }

  function handleSend() {
    const nextErrors: Record<string, string> = {}
    if (!recipient.trim()) nextErrors.recipient = "Recipient name is required."
    if (!message.trim()) nextErrors.message = "Message cannot be empty."
    if (channels.length === 0) nextErrors.channels = "Select at least one channel."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const businessUnitId =
      state.selectedBusinessUnitId === "all" ? state.businessUnits[0]?.id ?? "bu-ladrops" : state.selectedBusinessUnitId

    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `ntf-${Date.now()}`,
        recipient: recipient.trim(),
        message: message.trim(),
        channels,
        status: "sent",
        businessUnitId,
        createdAt: new Date().toISOString(),
      },
    })
    toast.success("Notification sent", { description: `Message sent to ${recipient.trim()}.` })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>Send a manual message to a customer via SMS, email, or in-app.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={!!errors.recipient || undefined}>
            <FieldLabel htmlFor="recipient">Recipient Name</FieldLabel>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Juan Dela Cruz"
              aria-invalid={!!errors.recipient}
            />
            {errors.recipient && <FieldError>{errors.recipient}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="template">Template (optional)</FieldLabel>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger id="template" className="w-full">
                <SelectValue>
                  {() => (templateId === "custom" ? "Custom message" : state.templates.find((t) => t.id === templateId)?.name)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="custom">Custom message</SelectItem>
                  {state.templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field data-invalid={!!errors.message || undefined}>
            <FieldLabel htmlFor="message">Message</FieldLabel>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message…"
              rows={4}
              aria-invalid={!!errors.message}
            />
            {errors.message && <FieldError>{errors.message}</FieldError>}
          </Field>
          <Field data-invalid={!!errors.channels || undefined}>
            <FieldLabel>Channels</FieldLabel>
            <div className="flex flex-col gap-2">
              {CHANNEL_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={channels.includes(opt.key)} onCheckedChange={() => toggleChannel(opt.key)} />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.channels && <FieldError>{errors.channels}</FieldError>}
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>Send Notification</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
