"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Droplets, Loader2, ShieldCheck, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useApp } from "@/lib/store"
import type { Role } from "@/lib/types"

const QUICK_LOGINS: Record<"owner" | "staff" | "customer", { email: string; name: string; initials: string }> = {
  owner: { email: "marisol@ladrops.ph", name: "Marisol Cruz", initials: "MC" },
  staff: { email: "angela@ladrops.ph", name: "Angela Reyes", initials: "AR" },
  customer: { email: "maria.santos@gmail.com", name: "Maria Santos", initials: "MS" },
}

export default function LoginPage() {
  const router = useRouter()
  const { dispatch } = useApp()
  const [quickRole, setQuickRole] = React.useState<"owner" | "staff" | "customer">("owner")
  const [email, setEmail] = React.useState(QUICK_LOGINS.owner.email)
  const [password, setPassword] = React.useState("password123")
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = React.useState(false)

  function handleQuickSelect(value: string[]) {
    const role = value[0] as "owner" | "staff" | "customer" | undefined
    if (!role) return
    setQuickRole(role)
    setEmail(QUICK_LOGINS[role].email)
    setPassword("password123")
    setErrors({})
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: { email?: string; password?: string } = {}
    if (!email.trim()) nextErrors.email = "Email is required."
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address."
    if (!password.trim()) nextErrors.password = "Password is required."
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    const roleMap: Record<string, Role> = { owner: "owner", staff: "staff", customer: "customer" }
    const info = QUICK_LOGINS[quickRole]
    window.setTimeout(() => {
      dispatch({
        type: "LOGIN",
        user: {
          name: info.name,
          email,
          role: roleMap[quickRole],
          businessUnitId: "bu-ladrops",
          initials: info.initials,
        },
      })
      router.push("/dashboard")
    }, 900)
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Image
          src="/images/login-hero.png"
          alt=""
          fill
          priority
          className="absolute inset-0 object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/70 to-sidebar/20" />
        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Droplets className="size-5" />
          </div>
          LA Drops Laundry MIS
        </div>
        <div className="relative z-10 max-w-md space-y-4">
          <h1 className="text-3xl font-semibold text-balance">Run every branch from one clean dashboard.</h1>
          <p className="text-sm leading-relaxed text-sidebar-foreground/70">
            Reservations, point-of-sale, notifications, and reports for LA Drops Laundry and partner businesses —
            all in one place.
          </p>
          <div className="flex items-center gap-4 pt-2 text-sm text-sidebar-foreground/70">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-accent" /> Role-based access
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-4 text-accent" /> Multi-branch ready
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 text-lg font-semibold lg:hidden">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Droplets className="size-5" />
              </div>
              LA Drops Laundry MIS
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to manage reservations, sales, and reports.</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Login as (demo)</p>
            <ToggleGroup defaultValue={["owner"]} onValueChange={handleQuickSelect} className="w-full" spacing={2}>
              <ToggleGroupItem value="owner" className="flex-1">
                Owner
              </ToggleGroupItem>
              <ToggleGroupItem value="staff" className="flex-1">
                Staff
              </ToggleGroupItem>
              <ToggleGroupItem value="customer" className="flex-1">
                Customer
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.email || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  placeholder="you@ladrops.ph"
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>
              <Field data-invalid={!!errors.password || undefined}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  placeholder="••••••••"
                />
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>
              <Button type="submit" disabled={loading} className="mt-2 w-full">
                {loading && <Loader2 className="animate-spin" data-icon="inline-start" />}
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </FieldGroup>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            This is a demo environment. Any password of 6+ characters will work.
          </p>
        </div>
      </div>
    </main>
  )
}
