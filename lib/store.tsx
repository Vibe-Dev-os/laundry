"use client"

import * as React from "react"
import { toast } from "sonner"
import type {
  BusinessUnit,
  CurrentUser,
  MessageTemplate,
  NotificationLogEntry,
  Reservation,
  ReservationStatus,
  Role,
  Sale,
  ServicePricing,
  StaffMember,
} from "./types"

interface AutomationToggles {
  onReady: boolean
  dayBefore: boolean
  onReceived: boolean
}

interface AppState {
  currentUser: CurrentUser | null
  businessUnits: BusinessUnit[]
  selectedBusinessUnitId: string
  reservations: Reservation[]
  sales: Sale[]
  notifications: NotificationLogEntry[]
  templates: MessageTemplate[]
  services: ServicePricing[]
  staff: StaffMember[]
  automation: AutomationToggles
  isHydrated: boolean
}

type Action =
  | { type: "HYDRATE"; data: Pick<AppState, "businessUnits" | "services" | "staff" | "reservations" | "sales" | "notifications" | "templates"> }
  | { type: "LOGIN"; user: CurrentUser }
  | { type: "LOGOUT" }
  | { type: "SET_ROLE"; role: Role }
  | { type: "SET_BUSINESS_UNIT"; id: string }
  | { type: "ADD_RESERVATION"; reservation: Reservation }
  | { type: "UPDATE_RESERVATION"; id: string; patch: Partial<Reservation> }
  | { type: "SET_RESERVATION_STATUS"; id: string; status: ReservationStatus }
  | { type: "DELETE_RESERVATION"; id: string }
  | { type: "ADD_SALE"; sale: Sale }
  | { type: "VOID_SALE"; id: string; reason: string }
  | { type: "ADD_NOTIFICATION"; notification: NotificationLogEntry }
  | { type: "ADD_TEMPLATE"; template: MessageTemplate }
  | { type: "UPDATE_TEMPLATE"; id: string; patch: Partial<MessageTemplate> }
  | { type: "DELETE_TEMPLATE"; id: string }
  | { type: "ADD_SERVICE"; service: ServicePricing }
  | { type: "UPDATE_SERVICE"; id: string; patch: Partial<ServicePricing> }
  | { type: "DELETE_SERVICE"; id: string }
  | { type: "ADD_STAFF"; staff: StaffMember }
  | { type: "UPDATE_STAFF"; id: string; patch: Partial<StaffMember> }
  | { type: "TOGGLE_STAFF_ACTIVE"; id: string }
  | { type: "TOGGLE_AUTOMATION"; key: keyof AutomationToggles }
  | { type: "TOGGLE_SHARE_DB"; id: string }
  | { type: "UPDATE_BUSINESS_UNIT"; id: string; patch: Partial<BusinessUnit> }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.data, isHydrated: true }
    case "LOGIN":
      return { ...state, currentUser: action.user, selectedBusinessUnitId: action.user.businessUnitId === "all" ? "all" : state.selectedBusinessUnitId }
    case "LOGOUT":
      return { ...state, currentUser: null }
    case "SET_ROLE":
      return state.currentUser ? { ...state, currentUser: { ...state.currentUser, role: action.role } } : state
    case "SET_BUSINESS_UNIT":
      return { ...state, selectedBusinessUnitId: action.id }
    case "ADD_RESERVATION":
      return { ...state, reservations: [action.reservation, ...state.reservations] }
    case "UPDATE_RESERVATION":
      return {
        ...state,
        reservations: state.reservations.map((r) => (r.id === action.id ? { ...r, ...action.patch } : r)),
      }
    case "SET_RESERVATION_STATUS":
      return {
        ...state,
        reservations: state.reservations.map((r) => (r.id === action.id ? { ...r, status: action.status } : r)),
      }
    case "DELETE_RESERVATION":
      return { ...state, reservations: state.reservations.filter((r) => r.id !== action.id) }
    case "ADD_SALE":
      return { ...state, sales: [action.sale, ...state.sales] }
    case "VOID_SALE":
      return {
        ...state,
        sales: state.sales.map((s) => (s.id === action.id ? { ...s, status: "voided", voidReason: action.reason } : s)),
      }
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.notification, ...state.notifications] }
    case "ADD_TEMPLATE":
      return { ...state, templates: [action.template, ...state.templates] }
    case "UPDATE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      }
    case "DELETE_TEMPLATE":
      return { ...state, templates: state.templates.filter((t) => t.id !== action.id) }
    case "ADD_SERVICE":
      return { ...state, services: [action.service, ...state.services] }
    case "UPDATE_SERVICE":
      return {
        ...state,
        services: state.services.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
      }
    case "DELETE_SERVICE":
      return { ...state, services: state.services.filter((s) => s.id !== action.id) }
    case "ADD_STAFF":
      return { ...state, staff: [action.staff, ...state.staff] }
    case "UPDATE_STAFF":
      return {
        ...state,
        staff: state.staff.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
      }
    case "TOGGLE_STAFF_ACTIVE":
      return {
        ...state,
        staff: state.staff.map((s) => (s.id === action.id ? { ...s, active: !s.active } : s)),
      }
    case "TOGGLE_AUTOMATION":
      return { ...state, automation: { ...state.automation, [action.key]: !state.automation[action.key] } }
    case "TOGGLE_SHARE_DB":
      return {
        ...state,
        businessUnits: state.businessUnits.map((b) => (b.id === action.id ? { ...b, shareCustomerDb: !b.shareCustomerDb } : b)),
      }
    case "UPDATE_BUSINESS_UNIT":
      return {
        ...state,
        businessUnits: state.businessUnits.map((b) => (b.id === action.id ? { ...b, ...action.patch } : b)),
      }
    default:
      return state
  }
}

function initState(): AppState {
  return {
    currentUser: null,
    businessUnits: [],
    selectedBusinessUnitId: "all",
    reservations: [],
    sales: [],
    notifications: [],
    templates: [],
    services: [],
    staff: [],
    automation: { onReady: true, dayBefore: true, onReceived: false },
    isHydrated: false,
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = React.createContext<AppContextValue | null>(null)

const JSON_HEADERS = { "Content-Type": "application/json" }

async function persistAction(action: Action, currentState: AppState): Promise<void> {
  switch (action.type) {
    case "ADD_RESERVATION":
      await fetch("/api/reservations", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(action.reservation) })
      break
    case "UPDATE_RESERVATION":
      await fetch(`/api/reservations/${action.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(action.patch) })
      break
    case "SET_RESERVATION_STATUS":
      await fetch(`/api/reservations/${action.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify({ status: action.status }) })
      break
    case "DELETE_RESERVATION":
      await fetch(`/api/reservations/${action.id}`, { method: "DELETE" })
      break
    case "ADD_SALE":
      await fetch("/api/sales", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(action.sale) })
      break
    case "VOID_SALE":
      await fetch(`/api/sales/${action.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify({ status: "voided", voidReason: action.reason }) })
      break
    case "ADD_NOTIFICATION":
      await fetch("/api/notifications", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(action.notification) })
      break
    case "ADD_TEMPLATE":
      await fetch("/api/templates", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(action.template) })
      break
    case "UPDATE_TEMPLATE":
      await fetch(`/api/templates/${action.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(action.patch) })
      break
    case "DELETE_TEMPLATE":
      await fetch(`/api/templates/${action.id}`, { method: "DELETE" })
      break
    case "ADD_SERVICE":
      await fetch("/api/services", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(action.service) })
      break
    case "UPDATE_SERVICE":
      await fetch(`/api/services/${action.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(action.patch) })
      break
    case "DELETE_SERVICE":
      await fetch(`/api/services/${action.id}`, { method: "DELETE" })
      break
    case "ADD_STAFF":
      await fetch("/api/staff", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(action.staff) })
      break
    case "UPDATE_STAFF":
      await fetch(`/api/staff/${action.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(action.patch) })
      break
    case "TOGGLE_STAFF_ACTIVE": {
      const member = currentState.staff.find((s) => s.id === action.id)
      if (member) {
        await fetch(`/api/staff/${action.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify({ active: !member.active }) })
      }
      break
    }
    case "TOGGLE_SHARE_DB": {
      const bu = currentState.businessUnits.find((b) => b.id === action.id)
      if (bu) {
        await fetch(`/api/business-units/${action.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify({ shareCustomerDb: !bu.shareCustomerDb }) })
      }
      break
    }
    case "UPDATE_BUSINESS_UNIT":
      await fetch(`/api/business-units/${action.id}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(action.patch) })
      break
    default:
      break
  }
}

const PERSISTENT_ACTIONS = new Set([
  "ADD_RESERVATION", "UPDATE_RESERVATION", "SET_RESERVATION_STATUS", "DELETE_RESERVATION",
  "ADD_SALE", "VOID_SALE",
  "ADD_NOTIFICATION",
  "ADD_TEMPLATE", "UPDATE_TEMPLATE", "DELETE_TEMPLATE",
  "ADD_SERVICE", "UPDATE_SERVICE", "DELETE_SERVICE",
  "ADD_STAFF", "UPDATE_STAFF", "TOGGLE_STAFF_ACTIVE",
  "TOGGLE_SHARE_DB", "UPDATE_BUSINESS_UNIT",
])

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, initState)
  // Keep a ref so persistAction reads current state without stale closure
  const stateRef = React.useRef(state)
  React.useEffect(() => { stateRef.current = state }, [state])

  // Fetch all data from MongoDB on mount
  React.useEffect(() => {
    async function hydrate() {
      try {
        const [businessUnits, services, staff, reservations, sales, notifications, templates] = await Promise.all([
          fetch("/api/business-units").then((r) => r.json()),
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/staff").then((r) => r.json()),
          fetch("/api/reservations").then((r) => r.json()),
          fetch("/api/sales").then((r) => r.json()),
          fetch("/api/notifications").then((r) => r.json()),
          fetch("/api/templates").then((r) => r.json()),
        ])
        dispatch({ type: "HYDRATE", data: { businessUnits, services, staff, reservations, sales, notifications, templates } })
      } catch {
        toast.error("Could not load data. Check MONGODB_URI and your network.")
      }
    }
    hydrate()
  }, [])

  // Optimistic update + background persistence
  const apiDispatch: React.Dispatch<Action> = React.useCallback((action: Action) => {
    dispatch(action)
    if (PERSISTENT_ACTIONS.has(action.type)) {
      persistAction(action, stateRef.current).catch(() => {
        toast.error("Failed to save. Please refresh the page.")
      })
    }
  }, [])

  const value = React.useMemo(() => ({ state, dispatch: apiDispatch }), [state, apiDispatch])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Branch Admin",
  staff: "Staff",
  customer: "Customer",
}
