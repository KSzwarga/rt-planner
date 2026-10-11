import type { FirstArchetypeEntry } from '../gamedata/types'
import type { Id } from '../model/buildPlan'

/**
 * Second archetypes that can follow a first archetype: those it lists. Without a first archetype,
 * the user can't pick one, though the validator keeps one loaded from a link (Architecture §6).
 * Shared by the UI and the validator.
 */
export function availableSecondArchetypeIds(firstArchetype: FirstArchetypeEntry | null): readonly Id[] {
  return firstArchetype?.allowedSecondArchetypeIds ?? []
}
