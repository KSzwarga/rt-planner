import { describe, expect, it } from 'vitest'
import { CHARACTERISTIC } from '../../src/gamedata/characteristics'
import type { Requirement, TalentList } from '../../src/gamedata/types'
import {
  availableTalentIds,
  requirementHolds,
  type TalentRuleTables,
  type TalentSlotRef,
  talentOptions,
  talentPoolLists,
} from '../../src/availability/talents'
import { background, characterState, firstArchetype, secondArchetype } from './fixtures'

const lists: TalentList[] = [
  { key: 'common', name: 'Common', talentIds: [1, 2] },
  { key: 'soldier', name: 'Soldier', talentIds: [2, 3] },
  { key: 'assassin', name: 'Assassin', talentIds: [4] },
  { key: 'exemplar', name: 'Exemplar', talentIds: [5] },
  { key: 'noble', name: 'Noble', talentIds: [6] },
]

function tables(requirements: Record<number, Requirement[]> = {}): TalentRuleTables {
  return { talentLists: lists, requirements: (id) => requirements[id] ?? [] }
}

function slot(kind: TalentSlotRef['kind'], level = 5): TalentSlotRef {
  const tier = kind.startsWith('second') ? 'second' : kind.startsWith('exemplar') ? 'exemplar' : 'first'
  return { tier, level, kind }
}

const soldierNoble = characterState({
  firstArchetype: firstArchetype(1, 'soldier'),
  secondArchetype: secondArchetype(1, 'assassin'),
  origin: background(6, ['noble']),
  talentLists: new Set(['noble']),
})

describe('talentPoolLists', () => {
  it("puts the owning archetype's list first, then common, then the build's lists", () => {
    expect(talentPoolLists(soldierNoble, slot('firstArchetypeTalent'))).toEqual(['soldier', 'common', 'noble'])
    expect(talentPoolLists(soldierNoble, slot('secondArchetypeTalent'))).toEqual(['assassin', 'common', 'noble'])
    expect(talentPoolLists(soldierNoble, slot('exemplarArchetypeTalent'))).toEqual(['exemplar', 'common', 'noble'])
  })

  it('has no archetype list in a common talent slot', () => {
    expect(talentPoolLists(soldierNoble, slot('commonTalent'))).toEqual(['common', 'noble'])
  })
})

describe('talentOptions', () => {
  it('lists each talent in the pool once, with every pool list that contains it', () => {
    const options = talentOptions(soldierNoble, slot('firstArchetypeTalent'), tables())
    expect(options.map(({ id, lists }) => [id, lists])).toEqual([
      [2, ['soldier', 'common']],
      [3, ['soldier']],
      [1, ['common']],
      [6, ['noble']],
    ])
  })

  it('leaves out talents outside the pool', () => {
    const ids = talentOptions(soldierNoble, slot('commonTalent'), tables()).map((option) => option.id)
    expect(ids).not.toContain(3)
    expect(ids).not.toContain(4)
  })

  it('shows a taken talent, but not as selectable', () => {
    const state = characterState({ ...soldierNoble, talentsTaken: new Set([1]) })
    const option = talentOptions(state, slot('commonTalent'), tables()).find((candidate) => candidate.id === 1)
    expect(option).toMatchObject({ isTaken: true, selectable: false, unmet: [] })
  })

  it('shows a talent with unmet requirements, listing them', () => {
    const requirement: Requirement = { kind: 'level', min: 10 }
    const option = talentOptions(soldierNoble, slot('commonTalent', 9), tables({ 1: [requirement] }))[0]
    expect(option).toMatchObject({ id: 1, isTaken: false, selectable: false, unmet: [requirement] })
  })
})

describe('availableTalentIds', () => {
  it('is the selectable part of the pool', () => {
    const state = characterState({ ...soldierNoble, talentsTaken: new Set([2]) })
    expect(availableTalentIds(state, slot('commonTalent'), tables({ 6: [{ kind: 'talent', id: 9 }] }))).toEqual([1])
  })
})

describe('requirementHolds', () => {
  const state = characterState({
    characteristics: new Map([[CHARACTERISTIC.STR, 45]]),
    talentsTaken: new Set([7]),
    abilitiesTaken: new Set([8]),
  })

  it.each<[string, Requirement, boolean]>([
    ['level reached', { kind: 'level', min: 5 }, true],
    ['level not reached', { kind: 'level', min: 6 }, false],
    ['talent taken', { kind: 'talent', id: 7 }, true],
    ['talent not taken', { kind: 'talent', id: 9 }, false],
    ['ability taken', { kind: 'ability', id: 8 }, true],
    ['characteristic just met', { kind: 'characteristic', id: CHARACTERISTIC.STR, min: 45 }, true],
    ['characteristic just missed', { kind: 'characteristic', id: CHARACTERISTIC.STR, min: 46 }, false],
    ['characteristic at its base value', { kind: 'characteristic', id: CHARACTERISTIC.AGI, min: 30 }, true],
    ['any of, one holds', { kind: 'anyOf', of: [{ kind: 'talent', id: 9 }, { kind: 'talent', id: 7 }] }, true],
    ['any of, none holds', { kind: 'anyOf', of: [{ kind: 'talent', id: 9 }, { kind: 'level', min: 6 }] }, false],
  ])('%s', (_, requirement, holds) => {
    expect(requirementHolds(requirement, state, slot('commonTalent', 5))).toBe(holds)
  })
})
