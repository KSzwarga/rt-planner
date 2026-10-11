import type { AbilityList, ListKey } from '../gamedata/types'
import type { Id } from '../model/buildPlan'
import type { AbilitySlotKind } from '../model/slotKinds'
import type { CharacterState, SlotRef } from './characterState'

export type AbilitySlotRef = SlotRef & { readonly kind: AbilitySlotKind }

/** An ability in a slot's pool. Abilities have no requirements, only the no-repeats rule. */
export interface AbilityOption {
  readonly id: Id
  /** The slot's pool lists that contain the ability, in pool order. */
  readonly lists: readonly ListKey[]
  /** Whether the ability was already taken before the slot. Abilities can be taken once. */
  readonly isTaken: boolean
  readonly selectable: boolean
}

/**
 * The lists in an ability slot's pool: the owning archetype's ability list, then the lists the
 * origin, homeworld and talents grant. There is no common ability list. The Exemplar has no
 * abilities of its own, so its ability slots offer both of its archetypes' lists.
 */
export function abilityPoolLists(state: CharacterState, slot: AbilitySlotRef): ListKey[] {
  const archetypeLists = {
    firstArchetypeAbility: [state.firstArchetype?.archetypeAbilityList],
    secondArchetypeAbility: [state.secondArchetype?.archetypeAbilityList],
    exemplarArchetypeAbility: [state.firstArchetype?.archetypeAbilityList, state.secondArchetype?.archetypeAbilityList],
  }[slot.kind].filter((key) => key !== undefined)
  return [...new Set([...archetypeLists, ...state.abilityLists])]
}

/** Every ability in a slot's pool, with whether it can be selected. */
export function abilityOptions(
  state: CharacterState,
  slot: AbilitySlotRef,
  abilityLists: readonly AbilityList[],
): AbilityOption[] {
  const listsByAbility = new Map<Id, ListKey[]>()
  for (const key of abilityPoolLists(state, slot)) {
    const list = abilityLists.find((candidate) => candidate.key === key)
    for (const abilityId of list?.abilityIds ?? []) {
      listsByAbility.set(abilityId, [...(listsByAbility.get(abilityId) ?? []), key])
    }
  }
  return [...listsByAbility].map(([id, lists]) => {
    const isTaken = state.abilitiesTaken.has(id)
    return { id, lists, isTaken, selectable: !isTaken }
  })
}

/** The abilities a slot can take. Shared by the UI and the validator. */
export function availableAbilityIds(
  state: CharacterState,
  slot: AbilitySlotRef,
  abilityLists: readonly AbilityList[],
): Id[] {
  return abilityOptions(state, slot, abilityLists)
    .filter((option) => option.selectable)
    .map((option) => option.id)
}
