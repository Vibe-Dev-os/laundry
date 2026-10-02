"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AlertCircle, Droplets, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Sparkles, User } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/lib/store"
import type { BusinessUnit, CurrentUser } from "@/lib/types"

type FormErrors = Record<string, string>
type Mode = "signin" | "signup"

export default function LoginPage() {
  const router = useRouter()
  const { dispatch } = useApp()

  const [mode, setMode] = React.useState<Mode>("signin")
  const [businessUnits, setBusinessUnits] = React.useState<BusinessUnit[]>([])

  const [name, setName] = React.useState("")
  const [businessUnitId, setBusinessUnitId] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    fetch("/api/business-units")
      .then((r) => r.json())
      .then((data: BusinessUnit[]) => {
        setBusinessUnits(data)
        if (data.length === 1) setBusinessUnitId(data[0].id)
      })
      .catch(() => {})
  }, [])

  function switchMode(next: Mode) {
    setMode(next)
    setErrors({})
    setFormError(null)
    setPassword("")
  }

  function validate() {
    const next: FormErrors = {}
    if (mode === "signup" && !name.trim()) next.name = "Your name is required."
    if (mode === "signup" && businessUnits.length > 1 && !businessUnitId) next.businessUnit = "Choose a business unit."
    if (!email.trim()) next.email = "Email is required."
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address."
    if (!password.trim()) next.password = "Password is required."
    else if (password.length < 6) next.password = "Password must be at least 6 characters."
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      const res = await fetch(mode === "signup" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup" ? { name, email, password, businessUnitId } : { email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || "Something went wrong. Please try again.")
        return
      }
      dispatch({ type: "LOGIN", user: data as CurrentUser })
      router.push("/dashboard")
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const noBusinessYet = mode === "signup" && businessUnits.length === 0

  return (
    <main className="relative grid min-h-svh overflow-hidden bg-background lg:grid-cols-2">
      {/* ambient glow, visible behind the whole page */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 size-[32rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 -bottom-32 size-[28rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Image
          src="/images/login-hero.png"
          alt=""
          fill
          priority
          className="absolute inset-0 object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/70 to-sidebar/20" />

        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30">
            <Droplets className="size-5" />
          </div>
          LA Drops Laundry MIS
        </div>
        <div className="relative z-10 max-w-md space-y-5 animate-in fade-in-0 slide-in-from-left-4 duration-700">
          <h1 className="bg-gradient-to-br from-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-balance text-transparent">
            Run every branch from one clean dashboard.
          </h1>
          <p className="text-sm leading-relaxed text-sidebar-foreground/70">
            Reservations, point-of-sale, notifications, and reports for LA Drops Laundry and partner businesses —
            all in one place.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-medium text-sidebar-foreground/80">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              <ShieldCheck className="size-3.5 text-accent" /> Role-based access
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-accent" /> Multi-branch ready
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 lg:hidden">
              <Droplets className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Sign up to book and track your own laundry reservations."
                  : "Sign in to manage reservations, sales, and reports."}
              </p>
            </div>
          </div>

          <div className="animate-in fade-in-0 slide-in-from-bottom-4 rounded-3xl border bg-card/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-xl duration-700 sm:p-8">
            <form onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                {noBusinessYet && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>
                      Sign-up isn&apos;t available yet — no business has been set up. Please check back later.
                    </AlertDescription>
                  </Alert>
                )}

                {mode === "signup" && (
                  <Field data-invalid={!!errors.name || undefined}>
                    <FieldLabel htmlFor="name">Your Name</FieldLabel>
                    <InputGroup className="h-11 rounded-xl">
                      <InputGroupAddon>
                        <User />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={!!errors.name}
                        placeholder="Juan Dela Cruz"
                      />
                    </InputGroup>
                    {errors.name && <FieldError>{errors.name}</FieldError>}
                  </Field>
                )}

                {mode === "signup" && businessUnits.length > 1 && (
                  <Field data-invalid={!!errors.businessUnit || undefined}>
                    <FieldLabel htmlFor="business-unit">Business Unit</FieldLabel>
                    <Select value={businessUnitId} onValueChange={setBusinessUnitId}>
                      <SelectTrigger id="business-unit" className="h-11 w-full rounded-xl">
                        <SelectValue>
                          {() => businessUnits.find((bu) => bu.id === businessUnitId)?.name ?? "Choose a branch"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {businessUnits.map((bu) => (
                            <SelectItem key={bu.id} value={bu.id}>
                              {bu.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.businessUnit && <FieldError>{errors.businessUnit}</FieldError>}
                  </Field>
                )}

                <Field data-invalid={!!errors.email || undefined}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <InputGroup className="h-11 rounded-xl">
                    <InputGroupAddon>
                      <Mail />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!errors.email}
                      placeholder="you@ladrops.ph"
                      autoComplete="email"
                    />
                  </InputGroup>
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.password || undefined}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <InputGroup className="h-11 rounded-xl">
                    <InputGroupAddon>
                      <Lock />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errors.password}
                      placeholder="••••••••"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {errors.password && <FieldError>{errors.password}</FieldError>}
                </Field>

                <Button
                  type="submit"
                  disabled={loading || noBusinessYet}
                  className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90"
                >
                  {loading && <Loader2 className="animate-spin" data-icon="inline-start" />}
                  {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                </Button>
              </FieldGroup>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button type="button" className="font-medium text-foreground underline underline-offset-2" onClick={() => switchMode("signin")}>
                  Sign in
                </button>
              </>
            ) : (
              <>
                Need to book laundry as a customer?{" "}
                <button type="button" className="font-medium text-foreground underline underline-offset-2" onClick={() => switchMode("signup")}>
                  Create an account
                </button>
                . Staff accounts are added by your business owner from Settings.
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  )
}
