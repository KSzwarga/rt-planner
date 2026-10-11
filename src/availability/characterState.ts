import type {
  FirstArchetypeEntry,
  HomeworldEntry,
  ListKey,
  OriginEntry,
  SecondArchetypeEntry,
} from '../gamedata/types'
import type { Id } from '../model/buildPlan'
import type { ChoiceSlotKind, UpgradeSlotKind } from '../model/slotKinds'

/** Which archetype owns a slot. */
export type ArchetypeTier = 'first' | 'second' | 'exemplar'

/** A choice slot, as the availability functions see it. */
export interface SlotRef {
  readonly tier: ArchetypeTier
  readonly level: number
  readonly kind: ChoiceSlotKind
}

/**
 * Everything the availability functions read, as it stands just before a slot (Availability Rules:
 * Character state). Derived by the validator's replay, never stored.
 */
export interface CharacterState {
  readonly origin: OriginEntry | null
  readonly homeworld: HomeworldEntry | null
  readonly firstArchetype: FirstArchetypeEntry | null
  readonly secondArchetype: SecondArchetypeEntry | null
  /** Current value of each characteristic, by ID (see `CHARACTERISTIC_BASE_VALUE`). */
  readonly characteristics: ReadonlyMap<Id, number>
  /** Times each characteristic was taken in `characteristicIncrease` slots. Starting increases don't count. */
  readonly characteristicIncreaseCounts: ReadonlyMap<Id, number>
  /** Times each skill was taken in `skillIncrease` slots. */
  readonly skillIncreaseCounts: ReadonlyMap<Id, number>
  readonly talentsTaken: ReadonlySet<Id>
  readonly abilitiesTaken: ReadonlySet<Id>
  /** Upgrades taken, by ultimate: every ultimate's upgrades use IDs 1–4. */
  readonly upgradesTaken: ReadonlyMap<UpgradeSlotKind, ReadonlySet<Id>>
  /** Talent lists granted so far by the origin, homeworld and talents. `common` is added by the talent rule. */
  readonly talentLists: ReadonlySet<ListKey>
  /** Ability lists granted so far by the origin, homeworld and talents. */
  readonly abilityLists: ReadonlySet<ListKey>
}

/** Every characteristic starts at this value (Availability Rules: Characteristic values). */
export const CHARACTERISTIC_BASE_VALUE = 30

/** What one starting increase or `characteristicIncrease` slot adds to a characteristic. */
export const INCREASE_AMOUNT = 5

export function characteristicValue(state: CharacterState, characteristicId: Id): number {
  return state.characteristics.get(characteristicId) ?? CHARACTERISTIC_BASE_VALUE
}
