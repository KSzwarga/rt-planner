import { type AbilitySlotRef, abilityOptions } from '../availability/abilities'
import {
  type ArchetypeTier,
  CHARACTERISTIC_BASE_VALUE,
  type CharacterState,
  INCREASE_AMOUNT,
  type SlotRef,
} from '../availability/characterState'
import { increaseUnavailableReason } from '../availability/increases'
import { requirementText } from '../availability/requirementText'
import { type TalentSlotRef, talentOptions } from '../availability/talents'
import { availableUpgradeIds } from '../availability/upgrades'
import type { FirstArchetypeEntry, HomeworldEntry, ListKey, OriginEntry, SecondArchetypeEntry } from '../gamedata/types'
import type { BuildPlan, Choice, Id } from '../model/buildPlan'
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

/** One archetype a build has, with the schema its choices follow. */
export interface ArchetypeTierSchema {
  readonly tier: ArchetypeTier
  readonly schema: Schema
}

/** The `BuildPlan` field that holds each tier's choices. */
export const CHOICES_FIELD = {
  first: 'firstArchetypeChoicesIds',
  second: 'secondArchetypeChoicesIds',
  exemplar: 'exemplarArchetypeChoicesIds',
} as const satisfies Record<ArchetypeTier, keyof BuildPlan>

/** A choice slot of a build: its archetype tier, and its index in that tier's choices array. */
export interface SlotPosition {
  readonly tier: ArchetypeTier
  readonly index: number
}

/** The archetypes a build has, in level order: first (1–15), second (16–35), Exemplar (36–55). */
export function archetypeTiers(start: ReplayStart, isExemplar: boolean, tables: ValidatorTables): ArchetypeTierSchema[] {
  return [
    ...(start.firstArchetype ? [{ tier: 'first' as const, schema: start.firstArchetype.schema }] : []),
    ...(start.secondArchetype ? [{ tier: 'second' as const, schema: start.secondArchetype.schema }] : []),
    ...(isExemplar ? [{ tier: 'exemplar' as const, schema: tables.exemplarSchema }] : []),
  ]
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
    increment(characteristics, characteristicId, amount, CHARACTERISTIC_BASE_VALUE)
  }
  for (const id of start.startingCharacteristicIncreasesIds) {
    if (id !== null) increment(characteristics, id, INCREASE_AMOUNT, CHARACTERISTIC_BASE_VALUE)
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
  tier: ArchetypeTier,
  schema: Schema,
  choices: readonly (Choice | null)[],
  state: ReplayState,
  tables: ValidatorTables,
): (Choice | null)[] {
  return choiceSlots(schema).map((slot, index) => {
    const ref: SlotRef = { tier, level: slot.level, kind: slot.kind }
    const field = `${CHOICES_FIELD[tier]}[${index}] (level ${slot.level} ${slot.kind})`
    const choice = validateId(field, choices[index] ?? null, (id) => illegalChoiceReason(id, ref, state, tables))
    if (choice !== null) applyChoice(choice, ref, state, tables)
    return choice
  })
}

/**
 * The character state just before a slot of a validated build: the static choices, plus every
 * choice in an earlier slot (an earlier level, or earlier in the same level). What a slot may hold
 * is decided against this state, so later choices never count.
 */
export function stateBeforeSlot(plan: BuildPlan, position: SlotPosition, tables: ValidatorTables): CharacterState {
  const start = replayStart(plan, tables)
  const state = initialState(start, tables)
  for (const { tier, schema } of archetypeTiers(start, plan.isExemplar, tables)) {
    const choices = plan[CHOICES_FIELD[tier]]
    for (const [index, slot] of choiceSlots(schema).entries()) {
      if (tier === position.tier && index === position.index) return state
      const choice = choices[index] ?? null
      if (choice !== null) applyChoice(choice, { tier, level: slot.level, kind: slot.kind }, state, tables)
    }
  }
  throw new Error(`The build has no ${position.tier} archetype slot ${position.index}`)
}

/** The replay start of a build whose static choices and archetypes are already validated. */
export function replayStart(plan: BuildPlan, tables: ValidatorTables): ReplayStart {
  return {
    origin: tables.origins.find((entry) => entry.id === plan.originId) ?? null,
    homeworld: tables.homeworlds.find((entry) => entry.id === plan.homeworldId) ?? null,
    startingCharacteristicIncreasesIds: plan.startingCharacteristicIncreasesIds,
    firstArchetype: tables.firstArchetypes.find((entry) => entry.id === plan.firstArchetypeId) ?? null,
    secondArchetype: tables.secondArchetypes.find((entry) => entry.id === plan.secondArchetypeId) ?? null,
  }
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
    if (option.unmet.length > 0) {
      return `unmet requirements: ${option.unmet.map((requirement) => requirementText(requirement, tables)).join(', ')}`
    }
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
    const unknown = unknownIdReason(id, tables.upgrades)
    if (unknown) return unknown
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
function applyChoice(id: Id, slot: SlotRef, state: ReplayState, tables: ValidatorTables): void {
  const { kind } = slot
  if (isTalentSlotKind(kind)) {
    // Talents' characteristic modifiers are applied once their data exists.
    state.talentsTaken.add(id)
    const grants = tables.talentGrants(id)
    for (const key of grants.talentLists) state.talentLists.add(key)
    for (const key of grants.abilityLists) state.abilityLists.add(key)
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

export function talentRuleTables(tables: ValidatorTables) {
  return { talentLists: tables.talentLists, requirements: tables.talentRequirements }
}
