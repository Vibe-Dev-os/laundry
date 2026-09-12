"use client"

import * as React from "react"
import type { ServiceKey, ServicePricing } from "@/lib/types"

export interface CartLine {
  serviceKey: ServiceKey
  name: string
  unitPrice: number
  unit: "per-kilo" | "per-load"
  qty: number
}

export function useCart() {
  const [lines, setLines] = React.useState<CartLine[]>([])

  function addService(service: ServicePricing) {
    setLines((prev) => {
      const existing = prev.find((l) => l.serviceKey === service.key)
      if (existing) {
        return prev.map((l) =>
          l.serviceKey === service.key ? { ...l, qty: l.qty + (service.unit === "per-kilo" ? 1 : 1) } : l
        )
      }
      return [
        ...prev,
        { serviceKey: service.key, name: service.name, unitPrice: service.price, unit: service.unit, qty: 1 },
      ]
    })
  }

  function updateQty(serviceKey: ServiceKey, qty: number) {
    setLines((prev) =>
      prev
        .map((l) => (l.serviceKey === serviceKey ? { ...l, qty: Math.max(0, qty) } : l))
        .filter((l) => l.qty > 0)
    )
  }

  function removeLine(serviceKey: ServiceKey) {
    setLines((prev) => prev.filter((l) => l.serviceKey !== serviceKey))
  }

  function clear() {
    setLines([])
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0)

  return { lines, addService, updateQty, removeLine, clear, subtotal }
}
