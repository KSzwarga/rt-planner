import { describe, expect, it } from 'vitest'
import { choiceSlots, type Schema } from './schema'

describe('choiceSlots', () => {
  it('lists the slots in level order, and in array order within a level', () => {
    const schema: Schema = {
      2: ['skillIncrease'],
      4: ['firstArchetypeTalent', 'characteristicIncrease'],
    }
    expect(choiceSlots(schema)).toEqual([
      { level: 2, kind: 'skillIncrease' },
      { level: 4, kind: 'firstArchetypeTalent' },
      { level: 4, kind: 'characteristicIncrease' },
    ])
  })

  it('sorts levels numerically, not as text', () => {
    const schema: Schema = { 10: ['commonTalent'], 9: ['firearmMasteryUpgrade'] }
    expect(choiceSlots(schema).map((slot) => slot.level)).toEqual([9, 10])
  })

  it('leaves out keystone features', () => {
    const schema: Schema = {
      1: ['runAndGunKeystoneFeature'],
      4: ['firearmMasteryUltimateKeystoneFeature', 'firstArchetypeTalent'],
    }
    expect(choiceSlots(schema)).toEqual([{ level: 4, kind: 'firstArchetypeTalent' }])
  })

  it('returns no slots for an empty schema', () => {
    expect(choiceSlots({})).toEqual([])
  })
})
