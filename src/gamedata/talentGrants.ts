import type { Id } from '../model/buildPlan'
import type { ListKey } from './types'

/** What taking a talent unlocks for every later slot, in any archetype (Availability Rules: Lists). */
export interface TalentGrants {
  readonly talentLists: readonly ListKey[]
  readonly abilityLists: readonly ListKey[]
}

const NO_GRANTS: TalentGrants = { talentLists: [], abilityLists: [] }

/**
 * Talent and ability lists granted by talents, by talent ID. Hand-written like the requirements,
 * apart from the generated talent table. No talent grants lists yet. Characteristics and skills a
 * talent unlocks are on their own entries (`availableForTalents`).
 */
export const TALENT_GRANTS: ReadonlyMap<Id, TalentGrants> = new Map()

export function talentGrants(talentId: Id): TalentGrants {
  return TALENT_GRANTS.get(talentId) ?? NO_GRANTS
}
