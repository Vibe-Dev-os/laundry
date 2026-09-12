import type { Role } from "./types"

export interface NavItem {
  key: string
  label: string
  href: string
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", roles: ["owner", "admin", "staff", "customer"] },
  { key: "reservations", label: "Reservations", href: "/reservations", roles: ["owner", "admin", "staff", "customer"] },
  { key: "sales", label: "Sales (POS)", href: "/sales", roles: ["owner", "admin", "staff"] },
  { key: "notifications", label: "Notifications", href: "/notifications", roles: ["owner", "admin", "staff"] },
  { key: "reports", label: "Reports", href: "/reports", roles: ["owner", "admin"] },
  { key: "settings", label: "Settings", href: "/settings", roles: ["owner", "admin"] },
]

export function canAccess(role: Role, key: string) {
  const item = NAV_ITEMS.find((n) => n.key === key)
  return item ? item.roles.includes(role) : false
}

export function canCreate(role: Role) {
  return role === "owner" || role === "admin" || role === "staff"
}

export function canManageSettings(role: Role) {
  return role === "owner" || role === "admin"
}

export function canDelete(role: Role) {
  return role === "owner" || role === "admin"
}
