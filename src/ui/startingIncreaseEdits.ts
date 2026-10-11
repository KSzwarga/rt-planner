import { availableStartingIncreaseIds } from '../availability/startingIncreases'
import type { CharacteristicEntry } from '../gamedata/types'
import type { Id } from '../model/buildPlan'

/**
 * Whether one more starting increase can go to this characteristic: a slot is free, and the
 * characteristic is available after the slots already taken.
 */
export function canAddStartingIncrease(
  ids: readonly (Id | null)[],
  characteristicId: Id,
  characteristics: readonly CharacteristicEntry[],
): boolean {
  const taken = ids.filter((id) => id !== null)
  return taken.length < ids.length && availableStartingIncreaseIds(taken, characteristics).includes(characteristicId)
}

/**
 * What clicking a characteristic's cell does: add one increase to it if possible, otherwise remove
 * all of its increases. So a cell cycles 0 → 1 → 2 → 0, and goes back to 0 early once all slots
 * are used. Taken slots are kept in order and moved to the front, so free slots are always last.
 */
export function cycleStartingIncrease(
  ids: readonly (Id | null)[],
  characteristicId: Id,
  characteristics: readonly CharacteristicEntry[],
): (Id | null)[] {
  const taken = ids.filter((id) => id !== null)
  const next = canAddStartingIncrease(ids, characteristicId, characteristics)
    ? [...taken, characteristicId]
    : taken.filter((id) => id !== characteristicId)
  return [...next, ...Array<null>(ids.length - next.length).fill(null)]
}
