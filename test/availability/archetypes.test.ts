import { describe, expect, it } from 'vitest'
import { availableSecondArchetypeIds } from '../../src/availability/archetypes'
import type { FirstArchetypeEntry } from '../../src/gamedata/types'

const soldier: FirstArchetypeEntry = {
  id: 1,
  name: 'Soldier',
  abbreviation: 'SOL',
  schema: {},
  archetypeTalentList: 'soldier',
  archetypeAbilityList: 'soldier',
  allowedSecondArchetypeIds: [2, 4],
}

describe('availableSecondArchetypeIds', () => {
  it('offers exactly the second archetypes the first allows', () => {
    expect(availableSecondArchetypeIds(soldier)).toEqual([2, 4])
  })

  it('offers none without a first archetype', () => {
    expect(availableSecondArchetypeIds(null)).toEqual([])
  })
})
