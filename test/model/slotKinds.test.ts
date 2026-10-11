import { describe, expect, it } from 'vitest'
import { type ChoiceSlotKind, choiceSlotBits, isKeystoneFeature } from '../../src/model/slotKinds'

describe('choiceSlotBits', () => {
  it.each<[ChoiceSlotKind, number]>([
    ['firstArchetypeTalent', 10],
    ['secondArchetypeTalent', 10],
    ['exemplarArchetypeTalent', 10],
    ['commonTalent', 10],
    ['firstArchetypeAbility', 8],
    ['secondArchetypeAbility', 8],
    ['exemplarArchetypeAbility', 8],
    ['skillIncrease', 4],
    ['characteristicIncrease', 4],
    ['firearmMasteryUpgrade', 3],
    ['daringBreachUpgrade', 3],
    ['dismantlingAttackUpgrade', 3],
    ['finestHourUpgrade', 3],
    ['deathWaltzUpgrade', 3],
    ['dispatchUpgrade', 3],
    ['carnivalOfMiseryUpgrade', 3],
  ])('%s takes %d bits', (kind, bits) => {
    expect(choiceSlotBits(kind)).toBe(bits)
  })

  it('rejects an unknown kind', () => {
    expect(() => choiceSlotBits('notASlotKind' as ChoiceSlotKind)).toThrow('Unknown slot kind')
  })
})

describe('isKeystoneFeature', () => {
  it('is true for a keystone feature slot', () => {
    expect(isKeystoneFeature({ kind: 'keystoneFeature', featureKey: 'runAndGun' })).toBe(true)
  })

  it.each(['commonTalent', 'firearmMasteryUpgrade', 'skillIncrease'] as const)('is false for %s', (kind) => {
    expect(isKeystoneFeature(kind)).toBe(false)
  })
})
