"use client"

import * as React from "react"
import { Send } from "lucide-react"

import { RequireRole } from "@/components/app-shell/require-role"
import { AutomationPanel } from "@/components/notifications/automation-panel"
import { NotificationLogTable } from "@/components/notifications/notification-log-table"
import { SendNotificationDialog } from "@/components/notifications/send-notification-dialog"
import { TemplatesPanel } from "@/components/notifications/templates-panel"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { filterByBU } from "@/lib/derived"
import { canCreate } from "@/lib/roles"
import { useApp } from "@/lib/store"

export default function NotificationsPage() {
  const { state } = useApp()
  const [sendOpen, setSendOpen] = React.useState(false)
  const role = state.currentUser?.role ?? "customer"

  const notifications = React.useMemo(
    () =>
      filterByBU(state.notifications, state.selectedBusinessUnitId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [state.notifications, state.selectedBusinessUnitId]
  )

  return (
    <RequireRole navKey="notifications">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">Send customer messages and manage automation.</p>
          </div>
          {canCreate(role) && (
            <Button onClick={() => setSendOpen(true)}>
              <Send data-icon="inline-start" />
              Send Notification
            </Button>
          )}
        </div>

        <Tabs defaultValue="log">
          <TabsList>
            <TabsTrigger value="log">Log</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>
          <TabsContent value="log" className="mt-4">
            <NotificationLogTable notifications={notifications} />
          </TabsContent>
          <TabsContent value="templates" className="mt-4">
            <TemplatesPanel />
          </TabsContent>
          <TabsContent value="automation" className="mt-4">
            <AutomationPanel />
          </TabsContent>
        </Tabs>

        <SendNotificationDialog open={sendOpen} onOpenChange={setSendOpen} />
      </div>
    </RequireRole>
  )
}
