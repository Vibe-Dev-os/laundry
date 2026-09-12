"use client"

import { Plus, Shirt, WashingMachine, Sparkles, Layers } from "lucide-react"

import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/derived"
import type { ServiceKey, ServicePricing } from "@/lib/types"

const SERVICE_ICONS: Record<ServiceKey, typeof Shirt> = {
  "wash-fold": WashingMachine,
  "wash-iron": Shirt,
  "dry-clean": Sparkles,
  comforter: Layers,
}

export function ServiceCatalog({
  services,
  onAdd,
}: {
  services: ServicePricing[]
  onAdd: (service: ServicePricing) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {services.map((service) => {
        const Icon = SERVICE_ICONS[service.key]
        return (
          <Card
            key={service.id}
            role="button"
            tabIndex={0}
            onClick={() => onAdd(service)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onAdd(service)
            }}
            className="group relative flex cursor-pointer flex-col gap-3 p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{service.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(service.price)} / {service.unit === "per-kilo" ? "kg" : "load"}
              </span>
            </div>
            <div className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
              <Plus className="size-3.5" />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
