import { randomBytes, scrypt, timingSafeEqual } from "crypto"
import { promisify } from "util"

const scryptAsync = promisify(scrypt)

// Stored format: "<salt-hex>:<hash-hex>"
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${derived.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string | undefined | null): Promise<boolean> {
  if (!stored || !stored.includes(":")) return false
  const [salt, hashHex] = stored.split(":")
  const hash = Buffer.from(hashHex, "hex")
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  if (derived.length !== hash.length) return false
  return timingSafeEqual(derived, hash)
}
