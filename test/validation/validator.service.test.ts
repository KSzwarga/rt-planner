import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import type {
  BackgroundEntry,
  FirstArchetypeEntry,
  SecondArchetypeEntry,
  SkillEntry,
} from '../../src/gamedata/types'
import { type BuildPlan, emptyBuildPlan } from '../../src/model/buildPlan'
import { validateBuild, type ValidatorTables } from '../../src/validation/validator'

function background(id: number): BackgroundEntry {
  return { id, name: `Background ${id}`, characteristicModifiers: [], grantsTalentLists: [], grantsAbilityLists: [] }
}

/** Skill 1–4. Both archetype tiers can improve all of them, so these tests keep archetype choices. */
function skill(id: number): SkillEntry {
  return {
    id,
    name: `Skill ${id}`,
    abbreviation: `S${id}`,
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForTalents: [],
    availableForFirstArchetypes: [1, 2],
    availableForSecondArchetypes: [1, 2],
  }
}

function firstArchetype(id: number, allowedSecondArchetypeIds: number[]): FirstArchetypeEntry {
  return {
    id,
    name: `First ${id}`,
    icon: 'gun',
    schema: { 1: ['skillIncrease'] },
    archetypeTalentList: 'first',
    archetypeAbilityList: 'first',
    allowedSecondArchetypeIds,
  }
}

function secondArchetype(id: number): SecondArchetypeEntry {
  return { id, name: `Second ${id}`, icon: 'dagger', schema: { 16: ['skillIncrease'] }, archetypeTalentList: 'second', archetypeAbilityList: 'second' }
}

const tables: ValidatorTables = {
  characteristics: [1, 2, 3, 4].map((id) => ({
    id,
    abbreviation: `C${id}`,
    name: `Characteristic ${id}`,
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForTalents: [],
    availableForFirstArchetypes: [],
    availableForSecondArchetypes: [],
  })),
  homeworlds: [background(1), background(2)],
  origins: [background(1), background(2)],
  triumphs: [1, 2, 3].map((id) => ({ id, name: `Triumph ${id}` })),
  darkestHours: [1, 2, 3].map((id) => ({ id, name: `Darkest hour ${id}` })),
  skills: [1, 2, 3, 4].map(skill),
  firstArchetypes: [firstArchetype(1, [1]), firstArchetype(2, [])],
  secondArchetypes: [secondArchetype(1), secondArchetype(2)],
  exemplarSchema: {},
  talents: [],
  talentLists: [],
  talentRequirements: () => [],
  talentGrants: () => ({ talentLists: [], abilityLists: [] }),
  abilities: [],
  abilityLists: [],
  upgrades: [],
}

function build(fields: Partial<BuildPlan>): BuildPlan {
  return { ...emptyBuildPlan(), ...fields }
}

describe('validateBuild', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('keeps a legal build unchanged, without warnings', () => {
    const plan = build({ homeworldId: 2, originId: 1, triumphId: 3, darkestHourId: 2 })
    expect(validateBuild(plan, tables)).toEqual(plan)
    expect(warn).not.toHaveBeenCalled()
  })

  it('keeps an empty build unchanged', () => {
    expect(validateBuild(emptyBuildPlan(), tables)).toEqual(emptyBuildPlan())
    expect(warn).not.toHaveBeenCalled()
  })

  it('keeps a triumph and darkest hour without an origin', () => {
    const plan = build({ triumphId: 1, darkestHourId: 3 })
    expect(validateBuild(plan, tables)).toEqual(plan)
  })

  it('nulls unknown homeworld, origin, triumph and darkest hour IDs, and logs each', () => {
    const plan = build({ homeworldId: 9, originId: 9, triumphId: 9, darkestHourId: 9 })
    expect(validateBuild(plan, tables)).toEqual(emptyBuildPlan())
    expect(warn.mock.calls).toEqual([
      ['Validator: nulled homeworldId 9: unknown ID.'],
      ['Validator: nulled originId 9: unknown ID.'],
      ['Validator: nulled triumphId 9: unknown ID.'],
      ['Validator: nulled darkestHourId 9: unknown ID.'],
    ])
  })

  it('nulls only the unknown IDs, and keeps the rest', () => {
    const plan = build({ homeworldId: 1, originId: 9, triumphId: 2, darkestHourId: 9 })
    expect(validateBuild(plan, tables)).toEqual(build({ homeworldId: 1, triumphId: 2 }))
  })

  it('keeps starting increases with at most two of each characteristic', () => {
    const plan = build({ startingCharacteristicIncreasesIds: [1, 1, 2, 2, 3, null] })
    expect(validateBuild(plan, tables)).toEqual(plan)
    expect(warn).not.toHaveBeenCalled()
  })

  it('nulls a third copy of a starting increase, keeping the first two', () => {
    const plan = build({ startingCharacteristicIncreasesIds: [2, 1, 2, 3, 2, 2] })
    expect(validateBuild(plan, tables).startingCharacteristicIncreasesIds).toEqual([2, 1, 2, 3, null, null])
    expect(warn.mock.calls).toEqual([
      ['Validator: nulled startingCharacteristicIncreasesIds[4] 2: characteristic already taken twice.'],
      ['Validator: nulled startingCharacteristicIncreasesIds[5] 2: characteristic already taken twice.'],
    ])
  })

  it('nulls an unknown starting increase, which does not count toward the limit', () => {
    const plan = build({ startingCharacteristicIncreasesIds: [9, 1, 1, null, null, null] })
    expect(validateBuild(plan, tables).startingCharacteristicIncreasesIds).toEqual([null, 1, 1, null, null, null])
    expect(warn).toHaveBeenCalledWith('Validator: nulled startingCharacteristicIncreasesIds[0] 9: unknown ID.')
  })

  it('keeps a second archetype that the first allows, with the choices of both', () => {
    const plan = build({
      firstArchetypeId: 1,
      firstArchetypeChoicesIds: [4],
      secondArchetypeId: 1,
      secondArchetypeChoicesIds: [null],
    })
    expect(validateBuild(plan, tables)).toEqual(plan)
  })

  it("nulls a second archetype the first doesn't allow, with its choices, and keeps the Exemplar", () => {
    const plan = build({
      firstArchetypeId: 2,
      firstArchetypeChoicesIds: [null],
      secondArchetypeId: 1,
      secondArchetypeChoicesIds: [3],
      isExemplar: true,
    })
    expect(validateBuild(plan, tables)).toEqual(
      build({ firstArchetypeId: 2, firstArchetypeChoicesIds: [null], isExemplar: true }),
    )
    expect(warn).toHaveBeenCalledWith('Validator: nulled secondArchetypeId 1: not allowed after First 2.')
  })

  it('keeps a second archetype without a first archetype', () => {
    const plan = build({ secondArchetypeId: 2, secondArchetypeChoicesIds: [null] })
    expect(validateBuild(plan, tables)).toEqual(plan)
  })

  it('nulls unknown archetypes with their choices', () => {
    const plan = build({
      firstArchetypeId: 9,
      firstArchetypeChoicesIds: [null],
      secondArchetypeId: 9,
      secondArchetypeChoicesIds: [null],
    })
    expect(validateBuild(plan, tables)).toEqual(emptyBuildPlan())
  })

  it('changes nothing when run on its own output', () => {
    const once = validateBuild(
      build({ homeworldId: 9, originId: 1, triumphId: 3, darkestHourId: 9, startingCharacteristicIncreasesIds: [1, 1, 1, 9, 2, 2] }),
      tables,
    )
    warn.mockClear()
    expect(validateBuild(once, tables)).toEqual(once)
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not change its input', () => {
    const plan = build({ originId: 9 })
    validateBuild(plan, tables)
    expect(plan).toEqual(build({ originId: 9 }))
  })
})
