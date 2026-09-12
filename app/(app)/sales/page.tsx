"use client"

import * as React from "react"

import { RequireRole } from "@/components/app-shell/require-role"
import { ServiceCatalog } from "@/components/sales/service-catalog"
import { CartPanel } from "@/components/sales/cart-panel"
import { SalesHistoryTable } from "@/components/sales/sales-history-table"
import { useCart } from "@/components/sales/use-cart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { filterByBU } from "@/lib/derived"
import { useApp } from "@/lib/store"

export default function SalesPage() {
  const { state } = useApp()
  const cart = useCart()

  const businessUnitId =
    state.selectedBusinessUnitId === "all"
      ? state.currentUser?.businessUnitId && state.currentUser.businessUnitId !== "all"
        ? state.currentUser.businessUnitId
        : state.businessUnits[0]?.id ?? "all"
      : state.selectedBusinessUnitId

  const services = filterByBU(state.services, businessUnitId)
  const sales = filterByBU(state.sales, state.selectedBusinessUnitId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <RequireRole navKey="sales">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Sales (POS)</h1>
          <p className="text-sm text-muted-foreground">Ring up walk-in orders and review transaction history</p>
        </div>

        <Tabs defaultValue="pos">
          <TabsList>
            <TabsTrigger value="pos">New Sale</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>
          <TabsContent value="pos" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <ServiceCatalog services={services} onAdd={cart.addService} />
              <CartPanel
                lines={cart.lines}
                subtotal={cart.subtotal}
                onUpdateQty={cart.updateQty}
                onRemove={cart.removeLine}
                onClear={cart.clear}
                businessUnitId={businessUnitId}
              />
            </div>
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <SalesHistoryTable sales={sales} businessUnitId={businessUnitId} />
          </TabsContent>
        </Tabs>
      </div>
    </RequireRole>
  )
}
