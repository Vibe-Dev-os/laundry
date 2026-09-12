"use client"

import * as React from "react"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/derived"
import { useApp } from "@/lib/store"
import type { PaymentMethod, SaleLineItem } from "@/lib/types"
import type { CartLine } from "./use-cart"

const PAYMENT_LABELS: Record<PaymentMethod, string> = { cash: "Cash", gcash: "GCash", card: "Card" }

interface CartPanelProps {
  lines: CartLine[]
  subtotal: number
  onUpdateQty: (serviceKey: CartLine["serviceKey"], qty: number) => void
  onRemove: (serviceKey: CartLine["serviceKey"]) => void
  onClear: () => void
  businessUnitId: string
}

export function CartPanel({ lines, subtotal, onUpdateQty, onRemove, onClear, businessUnitId }: CartPanelProps) {
  const { state, dispatch } = useApp()
  const [customerName, setCustomerName] = React.useState("")
  const [discountPct, setDiscountPct] = React.useState(0)
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("cash")
  const [tendered, setTendered] = React.useState("")

  const discount = Math.round(subtotal * (discountPct / 100))
  const total = Math.max(subtotal - discount, 0)
  const tenderedNum = Number(tendered) || 0
  const change = paymentMethod === "cash" ? Math.max(tenderedNum - total, 0) : 0
  const canCheckout =
    lines.length > 0 && customerName.trim().length > 0 && (paymentMethod !== "cash" || tenderedNum >= total)

  function handleCheckout() {
    const items: SaleLineItem[] = lines.map((l) => ({
      serviceKey: l.serviceKey,
      name: l.name,
      unitPrice: l.unitPrice,
      qty: l.qty,
      lineTotal: Math.round(l.unitPrice * l.qty),
    }))
    dispatch({
      type: "ADD_SALE",
      sale: {
        id: `TXN-${Date.now()}`,
        customerName: customerName.trim(),
        items,
        subtotal,
        discount,
        tax: 0,
        total,
        paymentMethod,
        amountTendered: paymentMethod === "cash" ? tenderedNum : undefined,
        change: paymentMethod === "cash" ? change : undefined,
        cashier: state.currentUser?.name ?? "Staff",
        businessUnitId,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    })
    toast.success("Sale completed", {
      description: `${formatCurrency(total)} charged to ${customerName.trim()} via ${PAYMENT_LABELS[paymentMethod]}.`,
    })
    onClear()
    setCustomerName("")
    setDiscountPct(0)
    setTendered("")
    setPaymentMethod("cash")
  }

  return (
    <Card className="flex h-fit flex-col">
      <CardHeader>
        <CardTitle>Current Order</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {lines.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <ShoppingCart />
            </EmptyMedia>
            <EmptyTitle>Cart is empty</EmptyTitle>
            <EmptyDescription>Tap a service to add it to the order.</EmptyDescription>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line.serviceKey} className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{line.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(line.unitPrice)} / {line.unit === "per-kilo" ? "kg" : "load"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onUpdateQty(line.serviceKey, line.qty - (line.unit === "per-kilo" ? 0.5 : 1))}
                  >
                    <Minus />
                  </Button>
                  <span className="w-10 text-center text-sm tabular-nums">{line.qty}</span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onUpdateQty(line.serviceKey, line.qty + (line.unit === "per-kilo" ? 0.5 : 1))}
                  >
                    <Plus />
                  </Button>
                </div>
                <span className="w-16 shrink-0 text-right text-sm font-medium tabular-nums">
                  {formatCurrency(line.unitPrice * line.qty)}
                </span>
                <Button variant="ghost" size="icon-sm" onClick={() => onRemove(line.serviceKey)}>
                  <Trash2 className="text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <Separator />

        <Field>
          <FieldLabel htmlFor="customer">Customer Name</FieldLabel>
          <Input
            id="customer"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Walk-in customer"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="discount">Discount %</FieldLabel>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={discountPct}
              onChange={(e) => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value))))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="payment-method">Payment Method</FieldLabel>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger id="payment-method" className="w-full">
                <SelectValue>{() => PAYMENT_LABELS[paymentMethod]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => (
                    <SelectItem key={m} value={m}>
                      {PAYMENT_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {paymentMethod === "cash" && (
          <Field>
            <FieldLabel htmlFor="tendered">Amount Tendered</FieldLabel>
            <Input
              id="tendered"
              type="number"
              min="0"
              value={tendered}
              onChange={(e) => setTendered(e.target.value)}
              placeholder="0"
            />
          </Field>
        )}

        <Separator />

        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Discount</span>
            <span className="tabular-nums">-{formatCurrency(discount)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
          {paymentMethod === "cash" && tenderedNum > 0 && (
            <div className="flex items-center justify-between text-success">
              <span>Change</span>
              <span className="tabular-nums">{formatCurrency(change)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full" size="lg" disabled={!canCheckout} onClick={handleCheckout}>
          Complete Sale — {formatCurrency(total)}
        </Button>
        {lines.length > 0 && (
          <Button variant="ghost" className="w-full" onClick={onClear}>
            Clear Order
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
