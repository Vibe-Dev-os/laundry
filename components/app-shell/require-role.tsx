"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { canAccess } from "@/lib/roles"
import { useApp } from "@/lib/store"

export function RequireRole({ navKey, children }: { navKey: string; children: React.ReactNode }) {
  const { state } = useApp()
  const router = useRouter()
  const role = state.currentUser?.role

  if (!role) return null

  if (!canAccess(role, navKey)) {
    return (
      <Empty className="mt-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Restricted for your role</EmptyTitle>
          <EmptyDescription>
            This section isn&apos;t available for the {role} role. Switch roles from the profile menu to preview it.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return <>{children}</>
}
