import type { CharacteristicEntry } from '../gamedata/types'
import type { Id } from '../model/buildPlan'

/** How many of the 6 starting increases can go to the same characteristic. */
export const MAX_STARTING_INCREASES_PER_CHARACTERISTIC = 2

/** How many times a characteristic appears among the given starting increases. */
export function countStartingIncreases(ids: readonly (Id | null)[], characteristicId: Id): number {
  return ids.filter((id) => id === characteristicId).length
}

/**
 * Characteristics a starting increase slot can take, given the slots before it: every
 * characteristic not already taken twice (Availability Rules: Starting characteristic increases).
 * Shared by the UI and the validator.
 */
export function availableStartingIncreaseIds(
  earlierIds: readonly (Id | null)[],
  characteristics: readonly CharacteristicEntry[],
): Id[] {
  return characteristics
    .map((characteristic) => characteristic.id)
    .filter((id) => countStartingIncreases(earlierIds, id) < MAX_STARTING_INCREASES_PER_CHARACTERISTIC)
}
