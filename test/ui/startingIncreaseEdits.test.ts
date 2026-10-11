import { describe, expect, it } from 'vitest'
import type { CharacteristicEntry } from '../../src/gamedata/types'
import { canAddStartingIncrease, cycleStartingIncrease } from '../../src/ui/startingIncreaseEdits'

const characteristics: readonly CharacteristicEntry[] = [1, 2, 3, 4].map((id) => ({
  id,
  abbreviation: `C${id}`,
  name: `Characteristic ${id}`,
  availableForOrigins: [],
  availableForHomeworlds: [],
  availableForFirstArchetypes: [],
  availableForSecondArchetypes: [],
}))

const EMPTY = [null, null, null, null, null, null]

describe('canAddStartingIncrease', () => {
  it('allows a characteristic taken less than twice while a slot is free', () => {
    expect(canAddStartingIncrease(EMPTY, 1, characteristics)).toBe(true)
    expect(canAddStartingIncrease([1, null, null, null, null, null], 1, characteristics)).toBe(true)
  })

  it('refuses a characteristic taken twice', () => {
    expect(canAddStartingIncrease([1, 1, null, null, null, null], 1, characteristics)).toBe(false)
  })

  it('refuses anything once all 6 slots are taken', () => {
    expect(canAddStartingIncrease([1, 1, 2, 2, 3, 3], 4, characteristics)).toBe(false)
  })
})

describe('cycleStartingIncrease', () => {
  it('cycles a characteristic 0 → 1 → 2 → 0', () => {
    const once = cycleStartingIncrease(EMPTY, 2, characteristics)
    expect(once).toEqual([2, null, null, null, null, null])
    const twice = cycleStartingIncrease(once, 2, characteristics)
    expect(twice).toEqual([2, 2, null, null, null, null])
    expect(cycleStartingIncrease(twice, 2, characteristics)).toEqual(EMPTY)
  })

  it('removes a characteristic taken once when all slots are taken', () => {
    expect(cycleStartingIncrease([1, 1, 2, 2, 3, 4], 4, characteristics)).toEqual([1, 1, 2, 2, 3, null])
  })

  it('keeps the other increases in order, with free slots last', () => {
    expect(cycleStartingIncrease([3, 1, 1, 4, null, null], 1, characteristics)).toEqual([3, 4, null, null, null, null])
  })

  it('leaves a full build unchanged for a characteristic it does not have', () => {
    expect(cycleStartingIncrease([1, 1, 2, 2, 3, 3], 4, characteristics)).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('does not change its input', () => {
    const ids = [1, null, null, null, null, null]
    cycleStartingIncrease(ids, 1, characteristics)
    expect(ids).toEqual([1, null, null, null, null, null])
  })
})
