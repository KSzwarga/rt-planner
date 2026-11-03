import { EXEMPLAR_TALENT_LIST } from '../gamedata/exemplar'
import type { ListKey, Requirement, TalentList } from '../gamedata/types'
import type { Id } from '../model/buildPlan'
import type { TalentSlotKind } from '../model/slotKinds'
import { type CharacterState, characteristicValue, type SlotRef } from './characterState'

/** The list that is always in every talent slot's pool. */
export const COMMON_TALENT_LIST: ListKey = 'common'

/** The talent data the talent rule reads. */
export interface TalentRuleTables {
  readonly talentLists: readonly TalentList[]
  readonly requirements: (talentId: Id) => readonly Requirement[]
}

export type TalentSlotRef = SlotRef & { readonly kind: TalentSlotKind }

/** A talent in a slot's pool (Availability Rules: UI, shown vs. selectable). */
export interface TalentOption {
  readonly id: Id
  /** The slot's pool lists that contain the talent, in pool order. The UI groups by these. */
  readonly lists: readonly ListKey[]
  /** Whether the talent was already taken before the slot. Talents can be taken once. */
  readonly isTaken: boolean
  /** Requirements that don't hold just before the slot. */
  readonly unmet: readonly Requirement[]
  readonly selectable: boolean
}

/**
 * The lists in a talent slot's pool, in the order the UI groups them: the owning archetype's lists
 * (archetype slots only: its own list, then its familiar's), `common`, then the lists granted by the
 * origin, homeworld and talents (Availability Rules: Rule 1).
 */
export function talentPoolLists(state: CharacterState, slot: TalentSlotRef): ListKey[] {
  return [...new Set([...archetypeTalentLists(state, slot.kind), COMMON_TALENT_LIST, ...state.talentLists])]
}

/** Every talent in a slot's pool, with whether it can be selected and why not. */
export function talentOptions(state: CharacterState, slot: TalentSlotRef, tables: TalentRuleTables): TalentOption[] {
  const listsByTalent = new Map<Id, ListKey[]>()
  for (const key of talentPoolLists(state, slot)) {
    const list = tables.talentLists.find((candidate) => candidate.key === key)
    for (const talentId of list?.talentIds ?? []) {
      listsByTalent.set(talentId, [...(listsByTalent.get(talentId) ?? []), key])
    }
  }

  return [...listsByTalent].map(([id, lists]) => {
    const isTaken = state.talentsTaken.has(id)
    const unmet = tables.requirements(id).filter((requirement) => !requirementHolds(requirement, state, slot))
    return { id, lists, isTaken, unmet, selectable: !isTaken && unmet.length === 0 }
  })
}

/** The talents a slot can take: the selectable part of its pool. Shared by the UI and the validator. */
export function availableTalentIds(state: CharacterState, slot: TalentSlotRef, tables: TalentRuleTables): Id[] {
  return talentOptions(state, slot, tables)
    .filter((option) => option.selectable)
    .map((option) => option.id)
}

/** Whether a requirement holds just before the slot (Availability Rules: Rule 2). */
export function requirementHolds(requirement: Requirement, state: CharacterState, slot: SlotRef): boolean {
  switch (requirement.kind) {
    case 'level':
      return slot.level >= requirement.min
    case 'talent':
      return state.talentsTaken.has(requirement.id)
    case 'ability':
      return state.abilitiesTaken.has(requirement.id)
    case 'characteristic':
      return characteristicValue(state, requirement.id) >= requirement.min
    case 'skillIncrease':
      return (state.skillIncreaseCounts.get(requirement.id) ?? 0) > 0
    case 'archetype': {
      const archetype = requirement.tier === 'first' ? state.firstArchetype : state.secondArchetype
      return archetype?.id === requirement.id
    }
    case 'origin':
      return state.origin?.id === requirement.id
    case 'anyOf':
      return requirement.of.some((option) => requirementHolds(option, state, slot))
    case 'noneOf':
      return !requirement.of.some((option) => requirementHolds(option, state, slot))
  }
}

/** The archetype lists of a talent slot. Only the Overseer, a second archetype, has a familiar. */
function archetypeTalentLists(state: CharacterState, kind: TalentSlotKind): ListKey[] {
  switch (kind) {
    case 'firstArchetypeTalent':
      return state.firstArchetype ? [state.firstArchetype.archetypeTalentList] : []
    case 'secondArchetypeTalent':
      return [state.secondArchetype?.archetypeTalentList, state.familiar?.talentList].filter((key) => key !== undefined)
    case 'exemplarArchetypeTalent':
      return [EXEMPLAR_TALENT_LIST]
    case 'commonTalent':
      return []
  }
}
