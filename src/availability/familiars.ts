import type { FamiliarEntry } from '../gamedata/types'
import type { Id } from '../model/buildPlan'

/**
 * The familiars a `familiar` slot can take (Availability Rules: Familiar): any of them. Only the
 * Overseer has the slot, as the first slot of its schema, so nothing before it can rule one out.
 */
export function availableFamiliarIds(familiars: readonly FamiliarEntry[]): Id[] {
  return familiars.map((familiar) => familiar.id)
}
