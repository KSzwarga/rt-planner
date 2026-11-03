import { describe, expect, it } from 'vitest'
import { availableUpgradeIds, upgradeNeedsFamiliar } from '../../src/availability/upgrades'
import { characterState, familiar } from './fixtures'

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

describe('an ultimate that depends on the familiar', () => {
  it('offers no upgrades before a familiar is picked', () => {
    expect(upgradeNeedsFamiliar(characterState(), 'overchargeUpgrade')).toBe(true)
    expect(availableUpgradeIds(characterState(), 'overchargeUpgrade')).toEqual([])
  })

  it('offers its 4 upgrades once a familiar is picked, minus those taken', () => {
    const state = characterState({
      familiar: familiar(1),
      upgradesTaken: new Map([['overchargeUpgrade', new Set([3])]]),
    })
    expect(upgradeNeedsFamiliar(state, 'overchargeUpgrade')).toBe(false)
    expect(availableUpgradeIds(state, 'overchargeUpgrade')).toEqual([1, 2, 4])
  })

  it("doesn't hold back an ultimate that doesn't depend on it", () => {
    expect(upgradeNeedsFamiliar(characterState(), 'dispatchUpgrade')).toBe(false)
  })
})
