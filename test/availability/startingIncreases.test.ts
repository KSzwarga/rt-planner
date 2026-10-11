import { describe, expect, it } from 'vitest'
import { availableStartingIncreaseIds, countStartingIncreases } from '../../src/availability/startingIncreases'
import type { CharacteristicEntry } from '../../src/gamedata/types'

const characteristics: readonly CharacteristicEntry[] = [1, 2, 3].map((id) => ({
  id,
  abbreviation: `C${id}`,
  name: `Characteristic ${id}`,
  availableForOrigins: [],
  availableForHomeworlds: [],
  availableForFirstArchetypes: [],
  availableForSecondArchetypes: [],
}))

describe('countStartingIncreases', () => {
  it('counts one characteristic, ignoring nulls and others', () => {
    expect(countStartingIncreases([1, null, 2, 1, null, 3], 1)).toBe(2)
    expect(countStartingIncreases([null, null, null, null, null, null], 1)).toBe(0)
  })
})

describe('availableStartingIncreaseIds', () => {
  it('offers every characteristic before any slot is taken', () => {
    expect(availableStartingIncreaseIds([], characteristics)).toEqual([1, 2, 3])
  })

  it('still offers a characteristic taken once', () => {
    expect(availableStartingIncreaseIds([2], characteristics)).toEqual([1, 2, 3])
  })

  it('stops offering a characteristic taken twice', () => {
    expect(availableStartingIncreaseIds([2, 1, 2], characteristics)).toEqual([1, 3])
  })

  it('ignores null slots', () => {
    expect(availableStartingIncreaseIds([null, 3, null, 3], characteristics)).toEqual([1, 2])
  })
})
