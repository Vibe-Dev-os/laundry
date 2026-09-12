import { NextResponse } from "next/server"

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

// Converts a lean mongoose doc (_id → id) or an array of them
export function toClient<T extends { _id?: unknown }>(doc: T): Omit<T, "_id"> & { id: unknown } {
  const { _id, ...rest } = doc
  return { id: _id, ...rest } as Omit<T, "_id"> & { id: unknown }
}

export function toClientArray<T extends { _id?: unknown }>(docs: T[]) {
  return docs.map(toClient)
}
