"use client"

import * as React from "react"
import { Bell, Mail, MessageSquare, Search } from "lucide-react"

import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { formatDateTime } from "@/lib/derived"
import type { NotificationLogEntry, NotificationStatus } from "@/lib/types"

const CHANNEL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  sms: MessageSquare,
  email: Mail,
  "in-app": Bell,
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "sent", label: "Sent" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
]

export function NotificationLogTable({ notifications }: { notifications: NotificationLogEntry[] }) {
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const filtered = notifications.filter((n) => {
    const matchesQuery = n.recipient.toLowerCase().includes(query.toLowerCase()) || n.message.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === "all" || n.status === (statusFilter as NotificationStatus)
    return matchesQuery && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="max-w-sm">
          <InputGroupInput placeholder="Search by recipient or message" value={query} onChange={(e) => setQuery(e.target.value)} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue>{() => STATUS_FILTERS.find((f) => f.value === statusFilter)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Bell />
          </EmptyMedia>
          <EmptyTitle>No notifications found</EmptyTitle>
          <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.recipient}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{n.message}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {n.channels.map((c) => {
                        const Icon = CHANNEL_ICON[c] ?? Bell
                        return <Icon key={c} className="size-4 text-muted-foreground" />
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={n.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(n.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
