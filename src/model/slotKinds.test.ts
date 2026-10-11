import { describe, expect, it } from 'vitest'
import { type ChoiceSlotKind, choiceSlotBits, isKeystoneFeature } from './slotKinds'

describe('choiceSlotBits', () => {
  it.each<[ChoiceSlotKind, number]>([
    ['firstArchetypeTalent', 9],
    ['secondArchetypeTalent', 9],
    ['exemplarArchetypeTalent', 9],
    ['commonTalent', 9],
    ['firstArchetypeAbility', 8],
    ['secondArchetypeAbility', 8],
    ['exemplarArchetypeAbility', 8],
    ['skillIncrease', 4],
    ['characteristicIncrease', 4],
    ['firearmMasteryUpgrade', 3],
    ['anyOtherUltimateUpgrade', 3],
  ])('%s takes %d bits', (kind, bits) => {
    expect(choiceSlotBits(kind)).toBe(bits)
  })

  it('rejects an unknown kind', () => {
    expect(() => choiceSlotBits('notASlotKind' as ChoiceSlotKind)).toThrow('Unknown slot kind')
  })
})

describe('isKeystoneFeature', () => {
  it.each(['runAndGunKeystoneFeature', 'firearmMasteryUltimateKeystoneFeature'] as const)(
    '%s is a keystone feature',
    (kind) => {
      expect(isKeystoneFeature(kind)).toBe(true)
    },
  )

  it.each(['commonTalent', 'firearmMasteryUpgrade', 'skillIncrease'] as const)('%s is not', (kind) => {
    expect(isKeystoneFeature(kind)).toBe(false)
  })
})
