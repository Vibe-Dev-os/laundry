"use client"

import { RequireRole } from "@/components/app-shell/require-role"
import { BusinessUnitsPanel } from "@/components/settings/business-units-panel"
import { ServicesPanel } from "@/components/settings/services-panel"
import { StaffPanel } from "@/components/settings/staff-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/lib/store"

export default function SettingsPage() {
  const { state } = useApp()

  return (
    <RequireRole navKey="settings">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage branches, service pricing, and your team.</p>
        </div>

        <Tabs defaultValue="branches">
          <TabsList>
            <TabsTrigger value="branches">Business Units</TabsTrigger>
            <TabsTrigger value="services">Services & Pricing</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          <TabsContent value="branches" className="mt-4">
            <BusinessUnitsPanel />
          </TabsContent>
          <TabsContent value="services" className="mt-4">
            <ServicesPanel businessUnitId={state.selectedBusinessUnitId} />
          </TabsContent>
          <TabsContent value="staff" className="mt-4">
            <StaffPanel businessUnitId={state.selectedBusinessUnitId} />
          </TabsContent>
        </Tabs>
      </div>
    </RequireRole>
  )
}
