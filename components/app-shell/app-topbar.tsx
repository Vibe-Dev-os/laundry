"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Bell,
  Building2,
  LogOut,
  Mail,
  MessageSquare,
  Monitor,
  Moon,
  Search,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useApp } from "@/lib/store"

const CHANNEL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  sms: MessageSquare,
  email: Mail,
  "in-app": Bell,
}

export function AppTopbar() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = React.useState("")

  const unreadCount = state.notifications.filter((n) => n.status === "pending").length
  const recentNotifications = state.notifications.slice(0, 5)

  function handleLogout() {
    dispatch({ type: "LOGOUT" })
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    toast("Signed out", { description: "You have been logged out." })
    router.push("/")
  }

  if (!state.currentUser) return null

  const isCustomer = state.currentUser.role === "customer"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <Select
        value={state.selectedBusinessUnitId}
        onValueChange={(v) => dispatch({ type: "SET_BUSINESS_UNIT", id: v })}
        disabled={isCustomer}
      >
        <SelectTrigger className="w-[200px]" size="sm">
          <Building2 data-icon="inline-start" className="text-muted-foreground" />
          <SelectValue placeholder="Business unit">
            {() =>
              state.selectedBusinessUnitId === "all"
                ? "All Business Units"
                : state.businessUnits.find((bu) => bu.id === state.selectedBusinessUnitId)?.name
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Business Units</SelectItem>
            {state.businessUnits.map((bu) => (
              <SelectItem key={bu.id} value={bu.id}>
                {bu.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="ml-2 hidden max-w-sm flex-1 md:block">
        <InputGroup>
          <InputGroupInput
            placeholder="Search customers, reservations, transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {!isCustomer && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
              <span className="relative">
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {recentNotifications.length === 0 && (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">No notifications yet.</div>
                )}
                {recentNotifications.map((n) => {
                  const Icon = CHANNEL_ICON[n.channels[0]] ?? Bell
                  return (
                    <DropdownMenuItem key={n.id} className="flex items-start gap-2">
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{n.recipient}</span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="ml-auto shrink-0"
                      >
                        {n.status}
                      </Badge>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="size-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="size-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="size-4" /> System
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" />}>
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
              {state.currentUser.initials}
            </span>
            <span className="hidden text-sm font-medium sm:inline">{state.currentUser.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{state.currentUser.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{state.currentUser.email}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
