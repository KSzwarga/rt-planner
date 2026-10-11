import type { Id } from '../model/buildPlan'
import type { Schema } from '../model/schema'

/** Key of a talent or ability list. Lists are never encoded, so keys are strings. */
export type ListKey = string

/** A fixed change to one characteristic. See Availability Rules: Characteristic values. */
export interface CharacteristicModifier {
  readonly characteristicId: Id
  readonly amount: number
}

/** Fields shared by every table entry. `id` is 1-based, 0 is null, and it is part of the URL format. */
export interface TableEntry {
  readonly id: Id
  readonly name: string
}

export interface CharacteristicEntry extends TableEntry {
  /** Short label shown in the UI, e.g. `BS`. */
  readonly abbreviation: string
}

/** A homeworld or origin: modifies characteristics, and unlocks talent and ability lists for every slot. */
export interface BackgroundEntry extends TableEntry {
  readonly characteristicModifiers: readonly CharacteristicModifier[]
  readonly grantsTalentLists: readonly ListKey[]
  readonly grantsAbilityLists: readonly ListKey[]
}

export type HomeworldEntry = BackgroundEntry
export type OriginEntry = BackgroundEntry

export type TriumphEntry = TableEntry
export type DarkestHourEntry = TableEntry

/** An archetype: its level progression, and the lists that apply only to its own archetype slots. */
export interface ArchetypeEntry extends TableEntry {
  readonly schema: Schema
  readonly archetypeTalentList: ListKey
  readonly archetypeAbilityList: ListKey
}

export interface FirstArchetypeEntry extends ArchetypeEntry {
  /** IDs in the second-archetype table that can follow this archetype. */
  readonly allowedSecondArchetypeIds: readonly Id[]
}

export type SecondArchetypeEntry = ArchetypeEntry
