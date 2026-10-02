import { createHmac, timingSafeEqual } from "crypto"
import type { NextResponse } from "next/server"

const SECRET = process.env.SESSION_SECRET

export const SESSION_COOKIE = "ladrops_session"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function sign(value: string) {
  if (!SECRET) throw new Error("SESSION_SECRET environment variable is not set.")
  return createHmac("sha256", SECRET).update(value).digest("hex")
}

export function createSessionCookieValue(staffId: string) {
  return `${staffId}.${sign(staffId)}`
}

// Returns the staff id if the cookie is present and its signature is valid, otherwise null.
export function verifySessionCookieValue(value: string | undefined | null): string | null {
  if (!value || !SECRET) return null
  const dot = value.lastIndexOf(".")
  if (dot === -1) return null
  const staffId = value.slice(0, dot)
  const providedSig = value.slice(dot + 1)
  const expectedSig = sign(staffId)
  const a = Buffer.from(providedSig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return staffId
}

export function setSessionCookie(res: NextResponse, staffId: string) {
  res.cookies.set(SESSION_COOKIE, createSessionCookieValue(staffId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.delete(SESSION_COOKIE)
}
