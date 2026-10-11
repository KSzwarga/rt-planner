import { availableSecondArchetypeIds } from '../availability/archetypes'
import type { ArchetypeTier } from '../availability/characterState'
import { availableStartingIncreaseIds } from '../availability/startingIncreases'
import { ABILITIES } from '../gamedata/abilities'
import { ABILITY_LISTS } from '../gamedata/abilityLists'
import { CHARACTERISTICS } from '../gamedata/characteristics'
import { DARKEST_HOURS } from '../gamedata/darkestHours'
import { EXEMPLAR_SCHEMA } from '../gamedata/exemplar'
import { FIRST_ARCHETYPES } from '../gamedata/firstArchetypes'
import { HOMEWORLDS } from '../gamedata/homeworlds'
import { ORIGINS } from '../gamedata/origins'
import { SECOND_ARCHETYPES } from '../gamedata/secondArchetypes'
import { SKILLS } from '../gamedata/skills'
import { TALENT_LISTS } from '../gamedata/talentLists'
import { type TalentGrants, talentGrants } from '../gamedata/talentGrants'
import { talentRequirements } from '../gamedata/talentRequirements'
import { TALENTS } from '../gamedata/talents'
import { TRIUMPHS } from '../gamedata/triumphs'
import { UPGRADES } from '../gamedata/upgrades'
import type {
  AbilityEntry,
  AbilityList,
  CharacteristicEntry,
  DarkestHourEntry,
  FirstArchetypeEntry,
  HomeworldEntry,
  OriginEntry,
  Requirement,
  SecondArchetypeEntry,
  SkillEntry,
  TalentEntry,
  TalentList,
  TriumphEntry,
  UpgradeEntry,
} from '../gamedata/types'
import type { BuildPlan, Id } from '../model/buildPlan'
import type { Schema } from '../model/schema'
import { unknownIdReason, validateId } from './nulling'
import { archetypeTiers, CHOICES_FIELD, initialState, type ReplayStart, replayChoices } from './replay'

/** The tables the validator checks against. Tests can pass small fixture tables of the same shape. */
export interface ValidatorTables {
  readonly characteristics: readonly CharacteristicEntry[]
  readonly skills: readonly SkillEntry[]
  readonly homeworlds: readonly HomeworldEntry[]
  readonly origins: readonly OriginEntry[]
  readonly triumphs: readonly TriumphEntry[]
  readonly darkestHours: readonly DarkestHourEntry[]
  readonly firstArchetypes: readonly FirstArchetypeEntry[]
  readonly secondArchetypes: readonly SecondArchetypeEntry[]
  readonly exemplarSchema: Schema
  readonly talents: readonly TalentEntry[]
  readonly talentLists: readonly TalentList[]
  readonly talentRequirements: (talentId: Id) => readonly Requirement[]
  readonly talentGrants: (talentId: Id) => TalentGrants
  readonly abilities: readonly AbilityEntry[]
  readonly abilityLists: readonly AbilityList[]
  readonly upgrades: readonly UpgradeEntry[]
}

export const GAME_TABLES: ValidatorTables = {
  characteristics: CHARACTERISTICS,
  skills: SKILLS,
  homeworlds: HOMEWORLDS,
  origins: ORIGINS,
  triumphs: TRIUMPHS,
  darkestHours: DARKEST_HOURS,
  firstArchetypes: FIRST_ARCHETYPES,
  secondArchetypes: SECOND_ARCHETYPES,
  exemplarSchema: EXEMPLAR_SCHEMA,
  talents: TALENTS,
  talentLists: TALENT_LISTS,
  talentRequirements,
  talentGrants,
  abilities: ABILITIES,
  abilityLists: ABILITY_LISTS,
  upgrades: UPGRADES,
}

/**
 * Returns the build with every illegal selection set to null, logging each one (Architecture §6).
 * Pure: the input is not changed, and validating the output changes nothing.
 *
 * Checks the static choices, then the archetypes, then replays every archetype choice in level
 * order against the character state so far, so a choice that an earlier change made illegal is
 * nulled, with anything that depended on it. A nulled archetype loses its choices. The Exemplar is
 * never nulled.
 */
export function validateBuild(plan: BuildPlan, tables: ValidatorTables = GAME_TABLES): BuildPlan {
  const homeworldId = validateId('homeworldId', plan.homeworldId, (id) => unknownIdReason(id, tables.homeworlds))
  const originId = validateId('originId', plan.originId, (id) => unknownIdReason(id, tables.origins))
  const triumphId = validateId('triumphId', plan.triumphId, (id) => unknownIdReason(id, tables.triumphs))
  const darkestHourId = validateId('darkestHourId', plan.darkestHourId, (id) => unknownIdReason(id, tables.darkestHours))
  const startingCharacteristicIncreasesIds = validateStartingIncreases(plan.startingCharacteristicIncreasesIds, tables)

  const firstArchetypeId = validateId('firstArchetypeId', plan.firstArchetypeId, (id) =>
    unknownIdReason(id, tables.firstArchetypes),
  )
  const firstArchetype = tables.firstArchetypes.find((entry) => entry.id === firstArchetypeId) ?? null
  // Kept without a first archetype, so a link can carry a second archetype on its own (decision 007).
  const secondArchetypeId = validateId(
    'secondArchetypeId',
    plan.secondArchetypeId,
    (id) =>
      unknownIdReason(id, tables.secondArchetypes) ??
      (firstArchetype === null || availableSecondArchetypeIds(firstArchetype).includes(id)
        ? null
        : `not allowed after ${firstArchetype.name}`),
  )
  const secondArchetype = tables.secondArchetypes.find((entry) => entry.id === secondArchetypeId) ?? null

  const start: ReplayStart = {
    origin: tables.origins.find((entry) => entry.id === originId) ?? null,
    homeworld: tables.homeworlds.find((entry) => entry.id === homeworldId) ?? null,
    startingCharacteristicIncreasesIds,
    firstArchetype,
    secondArchetype,
  }
  const state = initialState(start, tables)
  // Levels 1–15, then 16–35, then 36–55, each in schema order. A tier the build lacks has no choices.
  const choices: Pick<BuildPlan, (typeof CHOICES_FIELD)[ArchetypeTier]> = {
    firstArchetypeChoicesIds: [],
    secondArchetypeChoicesIds: [],
    exemplarArchetypeChoicesIds: [],
  }
  for (const { tier, schema } of archetypeTiers(start, plan.isExemplar, tables)) {
    choices[CHOICES_FIELD[tier]] = replayChoices(tier, schema, plan[CHOICES_FIELD[tier]], state, tables)
  }

  return {
    ...plan,
    homeworldId,
    originId,
    triumphId,
    darkestHourId,
    startingCharacteristicIncreasesIds,
    firstArchetypeId,
    secondArchetypeId,
    ...choices,
  }
}

/**
 * Checks each starting increase in order against the legal ones before it, so the first two copies
 * of a characteristic are kept and any later copy is nulled.
 */
function validateStartingIncreases(ids: readonly (Id | null)[], tables: ValidatorTables): (Id | null)[] {
  const validated: (Id | null)[] = []
  ids.forEach((startingId, index) => {
    validated.push(
      validateId(
        `startingCharacteristicIncreasesIds[${index}]`,
        startingId,
        (id) =>
          unknownIdReason(id, tables.characteristics) ??
          (availableStartingIncreaseIds(validated, tables.characteristics).includes(id)
            ? null
            : 'characteristic already taken twice'),
      ),
    )
  })
  return validated
}
