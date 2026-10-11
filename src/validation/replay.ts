import {
  type ArchetypeTier,
  CHARACTERISTIC_BASE_VALUE,
  type CharacterState,
  INCREASE_AMOUNT,
  type SlotRef,
} from '../availability/characterState'
import { type AbilitySlotRef, abilityOptions } from '../availability/abilities'
import { increaseUnavailableReason } from '../availability/increases'
import { type TalentSlotRef, talentOptions } from '../availability/talents'
import { availableUpgradeIds, UPGRADE_IDS } from '../availability/upgrades'
import type { FirstArchetypeEntry, HomeworldEntry, ListKey, OriginEntry, Requirement, SecondArchetypeEntry } from '../gamedata/types'
import type { Choice, Id } from '../model/buildPlan'
import { choiceSlots, type Schema } from '../model/schema'
import { isAbilitySlotKind, isTalentSlotKind, isUpgradeSlotKind, type UpgradeSlotKind } from '../model/slotKinds'
import { unknownIdReason, validateId } from './nulling'
import type { ValidatorTables } from './validator'

/** The character state during the replay. The availability functions read it as a `CharacterState`. */
interface ReplayState extends CharacterState {
  readonly characteristics: Map<Id, number>
  readonly characteristicIncreaseCounts: Map<Id, number>
  readonly skillIncreaseCounts: Map<Id, number>
  readonly talentsTaken: Set<Id>
  readonly abilitiesTaken: Set<Id>
  readonly upgradesTaken: Map<UpgradeSlotKind, Set<Id>>
  readonly talentLists: Set<ListKey>
  readonly abilityLists: Set<ListKey>
}

/** The validated static choices and archetypes the replay starts from. */
export interface ReplayStart {
  readonly origin: OriginEntry | null
  readonly homeworld: HomeworldEntry | null
  readonly startingCharacteristicIncreasesIds: readonly (Id | null)[]
  readonly firstArchetype: FirstArchetypeEntry | null
  readonly secondArchetype: SecondArchetypeEntry | null
}

/**
 * The initial state, from the static choices (Architecture §6: Chronological check, step 1): every
 * characteristic at 30, plus homeworld and origin modifiers and the starting increases, and the
 * talent and ability lists the origin and homeworld grant.
 */
export function initialState(start: ReplayStart, tables: ValidatorTables): ReplayState {
  const characteristics = new Map(tables.characteristics.map((entry) => [entry.id, CHARACTERISTIC_BASE_VALUE]))
  const backgrounds = [start.homeworld, start.origin].filter((entry) => entry !== null)
  for (const { characteristicId, amount } of backgrounds.flatMap((entry) => entry.characteristicModifiers)) {
    characteristics.set(characteristicId, (characteristics.get(characteristicId) ?? CHARACTERISTIC_BASE_VALUE) + amount)
  }
  for (const id of start.startingCharacteristicIncreasesIds) {
    if (id !== null) characteristics.set(id, (characteristics.get(id) ?? CHARACTERISTIC_BASE_VALUE) + INCREASE_AMOUNT)
  }

  return {
    origin: start.origin,
    homeworld: start.homeworld,
    firstArchetype: start.firstArchetype,
    secondArchetype: start.secondArchetype,
    characteristics,
    characteristicIncreaseCounts: new Map(),
    skillIncreaseCounts: new Map(),
    talentsTaken: new Set(),
    abilitiesTaken: new Set(),
    upgradesTaken: new Map(),
    talentLists: new Set([...(start.origin?.grantsTalentLists ?? []), ...(start.homeworld?.grantsTalentLists ?? [])]),
    abilityLists: new Set([...(start.origin?.grantsAbilityLists ?? []), ...(start.homeworld?.grantsAbilityLists ?? [])]),
  }
}

/**
 * Replays one archetype's choices in schema order (Architecture §6: Chronological check, steps 2–3).
 * Each choice is checked against the state so far: a legal one is applied, an illegal one is nulled
 * and not applied, so anything later that depended on it is nulled too. Returns one choice per
 * choice slot of the schema.
 */
export function replayChoices(
  field: string,
  tier: ArchetypeTier,
  schema: Schema,
  choices: readonly (Choice | null)[],
  state: ReplayState,
  tables: ValidatorTables,
): (Choice | null)[] {
  return choiceSlots(schema).map((slot, index) => {
    const ref: SlotRef = { tier, level: slot.level, kind: slot.kind }
    const choice = validateId(`${field}[${index}] (level ${slot.level} ${slot.kind})`, choices[index] ?? null, (id) =>
      illegalChoiceReason(id, ref, state, tables),
    )
    if (choice !== null) applyChoice(choice, ref, state)
    return choice
  })
}

/** Why a choice is illegal in its slot, or null if it is legal: the slot kind's availability rule. */
function illegalChoiceReason(id: Id, slot: SlotRef, state: ReplayState, tables: ValidatorTables): string | null {
  const { kind } = slot

  if (isTalentSlotKind(kind)) {
    const unknown = unknownIdReason(id, tables.talents)
    if (unknown) return unknown
    const talentSlot: TalentSlotRef = { ...slot, kind }
    const option = talentOptions(state, talentSlot, talentRuleTables(tables)).find((candidate) => candidate.id === id)
    if (option === undefined) return "not in the slot's talent lists"
    if (option.isTaken) return 'already taken'
    if (option.unmet.length > 0) return `unmet requirements: ${option.unmet.map((r) => describe(r, tables)).join(', ')}`
    return null
  }

  if (isAbilitySlotKind(kind)) {
    const unknown = unknownIdReason(id, tables.abilities)
    if (unknown) return unknown
    const abilitySlot: AbilitySlotRef = { ...slot, kind }
    const option = abilityOptions(state, abilitySlot, tables.abilityLists).find((candidate) => candidate.id === id)
    if (option === undefined) return "not in the slot's ability lists"
    return option.isTaken ? 'already taken' : null
  }

  if (isUpgradeSlotKind(kind)) {
    if (!UPGRADE_IDS.includes(id)) return 'unknown ID'
    return availableUpgradeIds(state, kind).includes(id) ? null : 'already taken'
  }

  const [entries, counts] =
    kind === 'characteristicIncrease'
      ? [tables.characteristics, state.characteristicIncreaseCounts]
      : [tables.skills, state.skillIncreaseCounts]
  const entry = entries.find((candidate) => candidate.id === id)
  if (entry === undefined) return 'unknown ID'
  return increaseUnavailableReason(entry, counts, state, slot.tier)
}

/** What a legal choice adds to the state (Availability Rules: How each choice changes the state). */
function applyChoice(id: Id, slot: SlotRef, state: ReplayState): void {
  const { kind } = slot
  if (isTalentSlotKind(kind)) {
    // Talents' granted lists and characteristic modifiers are applied once their data exists.
    state.talentsTaken.add(id)
  } else if (isAbilitySlotKind(kind)) {
    state.abilitiesTaken.add(id)
  } else if (isUpgradeSlotKind(kind)) {
    const taken = state.upgradesTaken.get(kind) ?? new Set<Id>()
    state.upgradesTaken.set(kind, taken.add(id))
  } else if (kind === 'characteristicIncrease') {
    increment(state.characteristicIncreaseCounts, id, 1)
    increment(state.characteristics, id, INCREASE_AMOUNT, CHARACTERISTIC_BASE_VALUE)
  } else {
    increment(state.skillIncreaseCounts, id, 1)
  }
}

function increment(counts: Map<Id, number>, id: Id, amount: number, initial = 0): void {
  counts.set(id, (counts.get(id) ?? initial) + amount)
}

function talentRuleTables(tables: ValidatorTables) {
  return { talentLists: tables.talentLists, requirements: tables.talentRequirements }
}

/** A requirement in words, for the log. */
function describe(requirement: Requirement, tables: ValidatorTables): string {
  switch (requirement.kind) {
    case 'level':
      return `level ${requirement.min}`
    case 'talent':
      return tables.talents.find((talent) => talent.id === requirement.id)?.name ?? `talent ${requirement.id}`
    case 'ability':
      return `ability ${requirement.id}`
    case 'characteristic': {
      const characteristic = tables.characteristics.find((entry) => entry.id === requirement.id)
      return `${characteristic?.abbreviation ?? `characteristic ${requirement.id}`} ${requirement.min}`
    }
    case 'anyOf':
      return `one of (${requirement.of.map((option) => describe(option, tables)).join(', ')})`
  }
}
