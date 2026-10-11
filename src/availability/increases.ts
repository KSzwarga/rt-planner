import type { IncreaseAvailability } from '../gamedata/types'
import type { Id } from '../model/buildPlan'
import type { ArchetypeTier, CharacterState } from './characterState'

/**
 * How many times one characteristic or skill can be taken in increase slots, in total, by the end
 * of each archetype (Availability Rules: Rule 2, cumulative cap).
 */
export const INCREASE_CAPS: Readonly<Record<ArchetypeTier, number>> = { first: 2, second: 4, exemplar: 6 }

type IncreaseEntry = IncreaseAvailability & { readonly id: Id }

/**
 * Why an increase-table entry can't be taken in a slot of this tier, or null if it can
 * (Availability Rules: Increase tables). `counts` are the times each entry of the same table was
 * taken before the slot.
 */
export function increaseUnavailableReason(
  entry: IncreaseEntry,
  counts: ReadonlyMap<Id, number>,
  state: CharacterState,
  tier: ArchetypeTier,
): string | null {
  if (!hasSource(entry, state, tier)) return 'not available to this archetype, origin or homeworld'
  if ((counts.get(entry.id) ?? 0) >= INCREASE_CAPS[tier]) return `already taken ${INCREASE_CAPS[tier]} times`
  return null
}

/** The entries of an increase table that a slot of this tier can take. Shared by the UI and the validator. */
export function availableIncreaseIds(
  entries: readonly IncreaseEntry[],
  counts: ReadonlyMap<Id, number>,
  state: CharacterState,
  tier: ArchetypeTier,
): Id[] {
  return entries.filter((entry) => increaseUnavailableReason(entry, counts, state, tier) === null).map((entry) => entry.id)
}

/** Rule 1: the build's origin or homeworld unlocks the entry, or the archetype that owns the slot does. */
function hasSource(entry: IncreaseEntry, state: CharacterState, tier: ArchetypeTier): boolean {
  if (state.origin !== null && entry.availableForOrigins.includes(state.origin.id)) return true
  if (state.homeworld !== null && entry.availableForHomeworlds.includes(state.homeworld.id)) return true
  switch (tier) {
    case 'first':
      return state.firstArchetype !== null && entry.availableForFirstArchetypes.includes(state.firstArchetype.id)
    case 'second':
      return state.secondArchetype !== null && entry.availableForSecondArchetypes.includes(state.secondArchetype.id)
    case 'exemplar':
      // The Exemplar can improve every characteristic and skill.
      return true
  }
}
