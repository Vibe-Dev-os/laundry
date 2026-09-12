"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-shell/app-sidebar"
import { AppTopbar } from "@/components/app-shell/app-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useApp } from "@/lib/store"

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const { state } = useApp()
  const router = useRouter()

  React.useEffect(() => {
    if (!state.currentUser) {
      router.replace("/")
    }
  }, [state.currentUser, router])

  if (!state.currentUser) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
          {!state.isHydrated ? (
            <div className="flex flex-1 items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <svg className="size-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm">Loading data…</span>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
