import { describe, expect, it } from 'vitest'
import type { ArchetypeSchemas } from '../../src/codec/codec'
import { type BuildPlan, emptyBuildPlan } from '../../src/model/buildPlan'
import type { Schema } from '../../src/model/schema'
import type { FirstArchetypeEntry } from '../../src/gamedata/types'
import {
  selectFirstArchetype,
  selectSecondArchetype,
  setExemplar,
  undoesEarlierChoices,
} from '../../src/ui/archetypeEdits'

const schemas: ArchetypeSchemas = {
  first: new Map<number, Schema>([
    [1, { 1: ['skillIncrease'], 2: ['commonTalent', 'characteristicIncrease'] }],
    [2, { 1: ['skillIncrease'] }],
  ]),
  second: new Map<number, Schema>([[1, { 16: ['secondArchetypeTalent', 'skillIncrease'] }]]),
  exemplar: { 36: ['exemplarArchetypeTalent'] },
}

function build(fields: Partial<BuildPlan>): BuildPlan {
  return { ...emptyBuildPlan(), ...fields }
}

describe('selectFirstArchetype', () => {
  it('starts a newly selected archetype with one empty choice per choice slot', () => {
    expect(selectFirstArchetype(emptyBuildPlan(), 1, schemas)).toEqual({
      firstArchetypeId: 1,
      firstArchetypeChoicesIds: [null, null, null],
    })
  })

  it('replaces the choices when switching archetype', () => {
    const plan = build({ firstArchetypeId: 1, firstArchetypeChoicesIds: [3, 4, 5] })
    expect(selectFirstArchetype(plan, 2, schemas)).toEqual({ firstArchetypeId: 2, firstArchetypeChoicesIds: [null] })
  })

  it('clears the archetype and its choices with null', () => {
    const plan = build({ firstArchetypeId: 1, firstArchetypeChoicesIds: [3, 4, 5] })
    expect(selectFirstArchetype(plan, null, schemas)).toEqual({ firstArchetypeId: null, firstArchetypeChoicesIds: [] })
  })

  it('keeps the choices when the same archetype is selected again', () => {
    const plan = build({ firstArchetypeId: 1, firstArchetypeChoicesIds: [3, 4, 5] })
    expect(selectFirstArchetype(plan, 1, schemas)).toEqual({})
  })
})

describe('selectSecondArchetype', () => {
  it('starts a newly selected archetype with one empty choice per choice slot', () => {
    expect(selectSecondArchetype(emptyBuildPlan(), 1, schemas)).toEqual({
      secondArchetypeId: 1,
      secondArchetypeChoicesIds: [null, null],
    })
  })
})

describe('setExemplar', () => {
  it('starts the Exemplar with one empty choice per choice slot', () => {
    expect(setExemplar(emptyBuildPlan(), true, schemas)).toEqual({ isExemplar: true, exemplarArchetypeChoicesIds: [null] })
  })

  it('drops the Exemplar and its choices', () => {
    const plan = build({ isExemplar: true, exemplarArchetypeChoicesIds: [7] })
    expect(setExemplar(plan, false, schemas)).toEqual({ isExemplar: false, exemplarArchetypeChoicesIds: [] })
  })
})

describe('undoesEarlierChoices', () => {
  function first(id: number, allowedSecondArchetypeIds: number[]): FirstArchetypeEntry {
    return { id, name: `First ${id}`, abbreviation: `F${id}`, schema: {}, archetypeTalentList: '', archetypeAbilityList: '', allowedSecondArchetypeIds }
  }
  // First 1 allows second 1. First 2 allows seconds 1 and 2. First 3 allows second 2.
  const firstArchetypes = [first(1, [1]), first(2, [1, 2]), first(3, [2])]

  function undoes(fields: Partial<BuildPlan>, change: Partial<BuildPlan>): boolean {
    return undoesEarlierChoices(build(fields), change, firstArchetypes)
  }

  it('is true when switching or clearing a first archetype that has choices', () => {
    const fields = { firstArchetypeId: 1, firstArchetypeChoicesIds: [null, 5] }
    expect(undoes(fields, { firstArchetypeId: 2 })).toBe(true)
    expect(undoes(fields, { firstArchetypeId: null })).toBe(true)
  })

  it('is true when switching or clearing a second archetype that has choices', () => {
    const fields = { firstArchetypeId: 2, secondArchetypeId: 1, secondArchetypeChoicesIds: [7] }
    expect(undoes(fields, { secondArchetypeId: 2 })).toBe(true)
    expect(undoes(fields, { secondArchetypeId: null })).toBe(true)
  })

  it("is true when the new first archetype doesn't allow the selected second", () => {
    expect(undoes({ firstArchetypeId: 2, secondArchetypeId: 1 }, { firstArchetypeId: 3 })).toBe(true)
  })

  it('is false when the new first archetype also allows the selected second', () => {
    expect(undoes({ firstArchetypeId: 1, secondArchetypeId: 1 }, { firstArchetypeId: 2 })).toBe(false)
  })

  it('is false when clearing the first archetype, which keeps the second', () => {
    expect(undoes({ firstArchetypeId: 1, secondArchetypeId: 1 }, { firstArchetypeId: null })).toBe(false)
  })

  it('is false when the archetype being switched has no choices yet', () => {
    expect(undoes({ firstArchetypeId: 1, firstArchetypeChoicesIds: [null, null] }, { firstArchetypeId: 2 })).toBe(false)
    expect(undoes({ secondArchetypeId: 1, secondArchetypeChoicesIds: [null] }, { secondArchetypeId: 2 })).toBe(false)
  })

  it('is false when selecting an archetype for the first time', () => {
    expect(undoes({}, { firstArchetypeId: 1 })).toBe(false)
    expect(undoes({ firstArchetypeId: 1 }, { secondArchetypeId: 1 })).toBe(false)
  })

  it("is false when the change doesn't touch an archetype", () => {
    expect(undoes({ firstArchetypeId: 1, firstArchetypeChoicesIds: [5] }, { originId: 2 })).toBe(false)
  })
})
