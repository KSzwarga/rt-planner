import { describe, expect, it } from 'vitest'
import { availableIncreaseIds, increaseUnavailableReason } from '../../src/availability/increases'
import { background, characterState, firstArchetype, increaseEntry, secondArchetype } from './fixtures'

describe('increaseUnavailableReason', () => {
  const noCounts = new Map<number, number>()

  it('allows an entry the owning first archetype can improve', () => {
    const entry = increaseEntry(3, { availableForFirstArchetypes: [1] })
    expect(increaseUnavailableReason(entry, noCounts, characterState({ firstArchetype: firstArchetype(1) }), 'first')).toBeNull()
  })

  it("refuses an entry only the other tier's archetype with the same ID can improve", () => {
    // First archetype 1 and second archetype 1 are different archetypes.
    const entry = increaseEntry(3, { availableForSecondArchetypes: [1] })
    const state = characterState({ firstArchetype: firstArchetype(1), secondArchetype: secondArchetype(1) })
    expect(increaseUnavailableReason(entry, noCounts, state, 'first')).toBe('not available to this archetype, origin, homeworld or earlier talents')
    expect(increaseUnavailableReason(entry, noCounts, state, 'second')).toBeNull()
  })

  it("allows an entry the build's origin or homeworld unlocks, in any tier", () => {
    const byOrigin = increaseEntry(3, { availableForOrigins: [7] })
    const byHomeworld = increaseEntry(4, { availableForHomeworlds: [2] })
    const state = characterState({ origin: background(7), homeworld: background(2) })
    for (const tier of ['first', 'second'] as const) {
      expect(increaseUnavailableReason(byOrigin, noCounts, state, tier)).toBeNull()
      expect(increaseUnavailableReason(byHomeworld, noCounts, state, tier)).toBeNull()
    }
  })

  it('allows every entry in Exemplar slots', () => {
    expect(increaseUnavailableReason(increaseEntry(3), noCounts, characterState(), 'exemplar')).toBeNull()
  })

  it.each([
    ['first', 2],
    ['second', 4],
    ['exemplar', 6],
  ] as const)('caps the %s archetype at %d in total', (tier, cap) => {
    const entry = increaseEntry(3, { availableForOrigins: [1] })
    const state = characterState({ origin: background(1) })
    expect(increaseUnavailableReason(entry, new Map([[3, cap - 1]]), state, tier)).toBeNull()
    expect(increaseUnavailableReason(entry, new Map([[3, cap]]), state, tier)).toBe(`already taken ${cap} times`)
  })
})

describe('availableIncreaseIds', () => {
  it('lists the entries with a source that are under the cap', () => {
    const entries = [
      increaseEntry(1, { availableForFirstArchetypes: [1] }),
      increaseEntry(2),
      increaseEntry(3, { availableForFirstArchetypes: [1] }),
    ]
    const state = characterState({ firstArchetype: firstArchetype(1) })
    expect(availableIncreaseIds(entries, new Map([[3, 2]]), state, 'first')).toEqual([1])
  })
})
