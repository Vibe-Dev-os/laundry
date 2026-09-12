"use client"

import * as React from "react"
import { MoreHorizontal, Receipt, Search } from "lucide-react"
import { toast } from "sonner"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, formatDateTime } from "@/lib/derived"
import { useApp } from "@/lib/store"
import { canDelete } from "@/lib/roles"
import type { Sale } from "@/lib/types"

const PAYMENT_LABELS: Record<Sale["paymentMethod"], string> = { cash: "Cash", gcash: "GCash", card: "Card" }

export function SalesHistoryTable({ sales, businessUnitId }: { sales: Sale[]; businessUnitId: string }) {
  const { state, dispatch } = useApp()
  const [query, setQuery] = React.useState("")
  const [voidTarget, setVoidTarget] = React.useState<Sale | null>(null)
  const [voidReason, setVoidReason] = React.useState("")

  const filtered = sales.filter((s) => s.customerName.toLowerCase().includes(query.toLowerCase()) || s.id.toLowerCase().includes(query.toLowerCase()))

  const role = state.currentUser?.role ?? "customer"

  function handleVoid() {
    if (!voidTarget) return
    dispatch({ type: "VOID_SALE", id: voidTarget.id, reason: voidReason.trim() || "No reason provided" })
    toast.success("Sale voided", { description: `${voidTarget.id} has been voided.` })
    setVoidTarget(null)
    setVoidReason("")
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <InputGroup className="max-w-sm">
          <InputGroupInput placeholder="Search by customer or transaction ID" value={query} onChange={(e) => setQuery(e.target.value)} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        {filtered.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>No transactions found</EmptyTitle>
            <EmptyDescription>Try adjusting your search.</EmptyDescription>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sale) => (
                  <TableRow key={sale.id} className={sale.status === "voided" ? "opacity-60" : undefined}>
                    <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                    <TableCell className="font-medium">{sale.customerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sale.items.map((i) => i.name).join(", ")}
                    </TableCell>
                    <TableCell>{PAYMENT_LABELS[sale.paymentMethod]}</TableCell>
                    <TableCell className="tabular-nums">{formatCurrency(sale.total)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === "voided" ? "destructive" : "secondary"}>
                        {sale.status === "voided" ? "Voided" : "Completed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(sale.createdAt)}</TableCell>
                    <TableCell>
                      {canDelete(role) && sale.status === "completed" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                            <MoreHorizontal />
                            <span className="sr-only">Actions</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem variant="destructive" onClick={() => setVoidTarget(sale)}>
                                Void Transaction
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={!!voidTarget} onOpenChange={(open) => !open && setVoidTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Transaction</DialogTitle>
            <DialogDescription>
              This will mark {voidTarget?.id} as voided. This action is logged and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="void-reason">Reason</FieldLabel>
            <Textarea
              id="void-reason"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation"
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleVoid}>
              Void Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
