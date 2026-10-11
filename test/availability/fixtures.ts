import type { CharacterState } from '../../src/availability/characterState'
import type { BackgroundEntry, FirstArchetypeEntry, IncreaseAvailability, SecondArchetypeEntry } from '../../src/gamedata/types'

/** A character state with nothing chosen, overridden by `fields`. Unit tests build their input directly. */
export function characterState(fields: Partial<CharacterState> = {}): CharacterState {
  return {
    origin: null,
    homeworld: null,
    firstArchetype: null,
    secondArchetype: null,
    characteristics: new Map(),
    characteristicIncreaseCounts: new Map(),
    skillIncreaseCounts: new Map(),
    talentsTaken: new Set(),
    abilitiesTaken: new Set(),
    upgradesTaken: new Map(),
    talentLists: new Set(),
    abilityLists: new Set(),
    ...fields,
  }
}

export function background(id: number, grantsTalentLists: string[] = []): BackgroundEntry {
  return { id, name: `Background ${id}`, characteristicModifiers: [], grantsTalentLists, grantsAbilityLists: [] }
}

export function firstArchetype(id: number, archetypeTalentList = `first${id}`): FirstArchetypeEntry {
  return {
    id,
    name: `First ${id}`,
    abbreviation: `F${id}`,
    schema: {},
    archetypeTalentList,
    archetypeAbilityList: archetypeTalentList,
    allowedSecondArchetypeIds: [],
  }
}

export function secondArchetype(id: number, archetypeTalentList = `second${id}`): SecondArchetypeEntry {
  return { id, name: `Second ${id}`, abbreviation: `S${id}`, schema: {}, archetypeTalentList, archetypeAbilityList: archetypeTalentList }
}

export function increaseEntry(id: number, fields: Partial<IncreaseAvailability> = {}): IncreaseAvailability & { id: number } {
  return {
    id,
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForTalents: [],
    availableForFirstArchetypes: [],
    availableForSecondArchetypes: [],
    ...fields,
  }
}
