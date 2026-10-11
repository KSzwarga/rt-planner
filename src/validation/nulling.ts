import type { TableEntry } from '../gamedata/types'
import type { Id } from '../model/buildPlan'

/**
 * Keeps a legal ID, and nulls and logs an illegal one (Architecture §6: Logging). `illegalReason`
 * returns null when the ID is legal.
 */
export function validateId(field: string, id: Id | null, illegalReason: (id: Id) => string | null): Id | null {
  if (id === null) return null
  const reason = illegalReason(id)
  if (reason === null) return id
  console.warn(`Validator: nulled ${field} ${id}: ${reason}.`)
  return null
}

export function unknownIdReason(id: Id, table: readonly TableEntry[]): string | null {
  return table.some((entry) => entry.id === id) ? null : 'unknown ID'
}
