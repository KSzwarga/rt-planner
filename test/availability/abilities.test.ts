import { describe, expect, it } from 'vitest'
import { type AbilitySlotRef, abilityOptions, abilityPoolLists, availableAbilityIds } from '../../src/availability/abilities'
import type { AbilityList } from '../../src/gamedata/types'
import { characterState, firstArchetype, secondArchetype } from './fixtures'

const lists: AbilityList[] = [
  { key: 'soldier', name: 'Soldier', abilityIds: [1, 2] },
  { key: 'assassin', name: 'Assassin', abilityIds: [3] },
  { key: 'commissar', name: 'Commissar', abilityIds: [2, 4] },
]

const state = characterState({
  firstArchetype: firstArchetype(1, 'soldier'),
  secondArchetype: secondArchetype(1, 'assassin'),
  abilityLists: new Set(['commissar']),
})

function slot(kind: AbilitySlotRef['kind']): AbilitySlotRef {
  const tier = kind.startsWith('second') ? 'second' : kind.startsWith('exemplar') ? 'exemplar' : 'first'
  return { tier, level: 10, kind }
}

describe('abilityPoolLists', () => {
  it("has the owning archetype's list, then the build's lists, and no common list", () => {
    expect(abilityPoolLists(state, slot('firstArchetypeAbility'))).toEqual(['soldier', 'commissar'])
    expect(abilityPoolLists(state, slot('secondArchetypeAbility'))).toEqual(['assassin', 'commissar'])
  })

  it("offers both archetypes' lists in Exemplar slots", () => {
    expect(abilityPoolLists(state, slot('exemplarArchetypeAbility'))).toEqual(['soldier', 'assassin', 'commissar'])
  })
})

describe('abilityOptions', () => {
  it('lists each ability in the pool once, with every pool list that contains it', () => {
    expect(abilityOptions(state, slot('firstArchetypeAbility'), lists).map(({ id, lists }) => [id, lists])).toEqual([
      [1, ['soldier']],
      [2, ['soldier', 'commissar']],
      [4, ['commissar']],
    ])
  })
})

describe('availableAbilityIds', () => {
  it('leaves out abilities already taken', () => {
    const taken = characterState({ ...state, abilitiesTaken: new Set([2]) })
    expect(availableAbilityIds(taken, slot('firstArchetypeAbility'), lists)).toEqual([1, 4])
  })
})
