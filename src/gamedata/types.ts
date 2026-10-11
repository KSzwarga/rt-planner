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

/**
 * What makes an increase-table entry (a characteristic or skill) available in `characteristicIncrease`
 * and `skillIncrease` slots (Availability Rules: Increase tables). First and second archetypes are
 * separate tables with overlapping IDs, so each has its own field. The Exemplar can improve every
 * entry. Talents that unlock entries are added once their data exists.
 */
export interface IncreaseAvailability {
  /** In every slot, if the build has one of these origins (the origin's "on advancement" bonus). */
  readonly availableForOrigins: readonly Id[]
  /** In every slot, if the build has one of these homeworlds. */
  readonly availableForHomeworlds: readonly Id[]
  /** Only in the slots of these first archetypes. */
  readonly availableForFirstArchetypes: readonly Id[]
  /** Only in the slots of these second archetypes. */
  readonly availableForSecondArchetypes: readonly Id[]
}

export interface CharacteristicEntry extends TableEntry, IncreaseAvailability {
  /** Short label shown in the UI, e.g. `BS`. */
  readonly abbreviation: string
}

export type SkillEntry = TableEntry & IncreaseAvailability

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

/**
 * A talent. `description` is its effect, as shown in the detail panel. Requirements, granted lists
 * and characteristic modifiers (Availability Rules: Talent table) are added once their data exists.
 */
export interface TalentEntry extends TableEntry {
  readonly description: string
}

/**
 * A condition a talent needs before it can be selected (Availability Rules: Rule 2). Each holds
 * just before the slot. The top-level array of a talent's requirements means all of them (AND).
 */
export type Requirement =
  | { readonly kind: 'level'; readonly min: number }
  | { readonly kind: 'talent'; readonly id: Id }
  | { readonly kind: 'ability'; readonly id: Id }
  | { readonly kind: 'characteristic'; readonly id: Id; readonly min: number }
  | { readonly kind: 'anyOf'; readonly of: readonly Requirement[] }

/** A named set of talents. Holds no rules, only membership (Availability Rules: Lists). */
export interface TalentList {
  readonly key: ListKey
  readonly name: string
  readonly talentIds: readonly Id[]
}

/**
 * An ability that ability slots can take. `description` is its effect. Keystone abilities and
 * ultimates are keystone features instead, since they are granted, never chosen.
 */
export interface AbilityEntry extends TableEntry {
  readonly description: string
}

/** A named set of abilities. Holds no rules, only membership (Availability Rules: Lists). */
export interface AbilityList {
  readonly key: ListKey
  readonly name: string
  readonly abilityIds: readonly Id[]
}

/** A keystone feature: fixed by an archetype's schema, never chosen. */
export interface KeystoneFeatureEntry {
  readonly name: string
  /** Whether it is the archetype's ultimate, such as Firearm Mastery, upgraded by its upgrade slots. */
  readonly isUltimate: boolean
}

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
