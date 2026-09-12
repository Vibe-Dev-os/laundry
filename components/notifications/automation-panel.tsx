"use client"

import { CheckCircle2, Clock, PackageCheck } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { canManageSettings } from "@/lib/roles"
import { useApp } from "@/lib/store"

const AUTOMATIONS = [
  {
    key: "onReady" as const,
    icon: CheckCircle2,
    title: "Order Ready",
    description: "Automatically notify the customer as soon as their order status changes to Ready.",
  },
  {
    key: "dayBefore" as const,
    icon: Clock,
    title: "Pickup Reminder",
    description: "Send a reminder one day before the customer's scheduled pickup or drop-off.",
  },
  {
    key: "onReceived" as const,
    icon: PackageCheck,
    title: "Order Received",
    description: "Notify the customer once their laundry has been received and processing has started.",
  },
]

export function AutomationPanel() {
  const { state, dispatch } = useApp()
  const role = state.currentUser?.role ?? "customer"
  const canManage = canManageSettings(role)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Configure automatic customer notifications triggered by reservation events.
      </p>
      <div className="flex flex-col gap-3">
        {AUTOMATIONS.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.key} className="flex items-start gap-4 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
              <Switch
                checked={state.automation[item.key]}
                onCheckedChange={() => dispatch({ type: "TOGGLE_AUTOMATION", key: item.key })}
                disabled={!canManage}
              />
            </Card>
          )
        })}
      </div>
      {!canManage && (
        <p className="text-xs text-muted-foreground">Only owners can change automation settings.</p>
      )}
    </div>
  )
}
