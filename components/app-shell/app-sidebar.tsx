"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Bell,
  CalendarClock,
  Droplets,
  LayoutDashboard,
  Settings,
  ShoppingCart,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NAV_ITEMS } from "@/lib/roles"
import { useApp } from "@/lib/store"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  reservations: CalendarClock,
  sales: ShoppingCart,
  notifications: Bell,
  reports: BarChart3,
  settings: Settings,
}

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useApp()
  const role = state.currentUser?.role ?? "staff"
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Droplets className="size-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-semibold">LA Drops</span>
                <span className="text-xs text-muted-foreground">Laundry MIS</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = ICONS[item.key]
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          © {new Date().getFullYear()} LA Drops Laundry
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
