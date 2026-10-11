import { describe, expect, it } from 'vitest'
import { FIELD_BITS } from '../codec/layout'
import { CHARACTERISTIC, CHARACTERISTICS } from './characteristics'
import { DARKEST_HOURS } from './darkestHours'
import { FIRST_ARCHETYPES } from './firstArchetypes'
import { HOMEWORLDS } from './homeworlds'
import { ORIGINS } from './origins'
import { SECOND_ARCHETYPES } from './secondArchetypes'
import { TRIUMPHS } from './triumphs'
import type { ArchetypeEntry, BackgroundEntry, TableEntry } from './types'

const TABLES: { name: string; entries: readonly TableEntry[]; bits: number }[] = [
  { name: 'characteristics', entries: CHARACTERISTICS, bits: FIELD_BITS.startingCharacteristicIncrease },
  { name: 'homeworlds', entries: HOMEWORLDS, bits: FIELD_BITS.homeworldId },
  { name: 'origins', entries: ORIGINS, bits: FIELD_BITS.originId },
  { name: 'triumphs', entries: TRIUMPHS, bits: FIELD_BITS.triumphId },
  { name: 'darkest hours', entries: DARKEST_HOURS, bits: FIELD_BITS.darkestHourId },
  { name: 'first archetypes', entries: FIRST_ARCHETYPES, bits: FIELD_BITS.firstArchetypeId },
  { name: 'second archetypes', entries: SECOND_ARCHETYPES, bits: FIELD_BITS.secondArchetypeId },
]

describe.each(TABLES)('$name table', ({ entries, bits }) => {
  it('has at least one entry', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  it('has unique IDs', () => {
    const ids = entries.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it(`has IDs from 1 that fit in ${bits} bits`, () => {
    for (const { id } of entries) {
      expect(Number.isInteger(id)).toBe(true)
      expect(id).toBeGreaterThanOrEqual(1)
      expect(id).toBeLessThan(2 ** bits)
    }
  })

  it('has a name for every entry', () => {
    for (const { name } of entries) {
      expect(name.trim()).not.toBe('')
    }
  })
})

describe.each([
  { name: 'first archetype', entries: FIRST_ARCHETYPES as readonly ArchetypeEntry[], minLevel: 1, maxLevel: 15 },
  { name: 'second archetype', entries: SECOND_ARCHETYPES as readonly ArchetypeEntry[], minLevel: 16, maxLevel: 35 },
])('$name schemas', ({ entries, minLevel, maxLevel }) => {
  it.each(entries.map((entry) => [entry.name, entry] as const))(
    `%s covers every level from ${minLevel} to ${maxLevel}, and no other`,
    (_, { schema }) => {
      const levels = Object.keys(schema).map(Number).sort((a, b) => a - b)
      expect(levels).toEqual(Array.from({ length: maxLevel - minLevel + 1 }, (__, i) => minLevel + i))
    },
  )

  it.each(entries.map((entry) => [entry.name, entry] as const))('%s has at least one slot per level', (_, { schema }) => {
    for (const slots of Object.values(schema)) {
      expect(slots.length).toBeGreaterThan(0)
    }
  })
})

describe('first archetypes', () => {
  it('only allow second archetypes that exist', () => {
    const secondIds = new Set(SECOND_ARCHETYPES.map((entry) => entry.id))
    for (const { allowedSecondArchetypeIds } of FIRST_ARCHETYPES) {
      for (const id of allowedSecondArchetypeIds) {
        expect(secondIds).toContain(id)
      }
    }
  })
})

describe('characteristics', () => {
  it('has one entry per CHARACTERISTIC ID, with the matching abbreviation', () => {
    expect(CHARACTERISTICS.map(({ id, abbreviation }) => [abbreviation, id])).toEqual(Object.entries(CHARACTERISTIC))
  })
})

describe.each([
  { name: 'homeworlds', entries: HOMEWORLDS as readonly BackgroundEntry[] },
  { name: 'origins', entries: ORIGINS as readonly BackgroundEntry[] },
])('$name', ({ entries }) => {
  it('only modify characteristics that exist', () => {
    const characteristicIds = new Set(CHARACTERISTICS.map((entry) => entry.id))
    for (const { characteristicModifiers } of entries) {
      for (const { characteristicId } of characteristicModifiers) {
        expect(characteristicIds).toContain(characteristicId)
      }
    }
  })
})
