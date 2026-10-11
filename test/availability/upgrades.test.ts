import { describe, expect, it } from 'vitest'
import { availableUpgradeIds } from '../../src/availability/upgrades'
import { characterState } from './fixtures'

describe('availableUpgradeIds', () => {
  it('offers all 4 upgrades before any is taken', () => {
    expect(availableUpgradeIds(characterState(), 'firearmMasteryUpgrade')).toEqual([1, 2, 3, 4])
  })

  it('leaves out upgrades already taken for the same ultimate', () => {
    const state = characterState({ upgradesTaken: new Map([['firearmMasteryUpgrade', new Set([2])]]) })
    expect(availableUpgradeIds(state, 'firearmMasteryUpgrade')).toEqual([1, 3, 4])
  })

  it("isn't affected by another ultimate's upgrades, which use the same IDs", () => {
    const state = characterState({ upgradesTaken: new Map([['daringBreachUpgrade', new Set([2])]]) })
    expect(availableUpgradeIds(state, 'firearmMasteryUpgrade')).toEqual([1, 2, 3, 4])
  })
})
