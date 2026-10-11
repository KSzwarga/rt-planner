import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import { type BuildPlan, emptyBuildPlan } from '../../src/model/buildPlan'
import type { Schema } from '../../src/model/schema'
import type { KeystoneFeatureSlot } from '../../src/model/slotKinds'
import { bitsToBase64url } from '../../src/codec/base64url'
import { BitWriter } from '../../src/codec/bits'
import { type ArchetypeSchemas, decodeBuild, encodeBuild } from '../../src/codec/codec'
import { DecodeError } from '../../src/codec/errors'

/** A keystone feature slot. Model and codec tests use made-up keys, so they don't depend on the game data. */
function keystone(featureKey: string): KeystoneFeatureSlot {
  return { kind: 'keystoneFeature', featureKey }
}

/** The first-archetype example from Architecture §4.3: 22 choice slots. */
const EXAMPLE_FIRST_SCHEMA: Schema = {
  1: [keystone('runAndGun')],
  2: ['skillIncrease'],
  3: [keystone('revelInSlaughter')],
  4: [keystone('firearmMastery'), 'firstArchetypeTalent'],
  5: ['characteristicIncrease', 'firstArchetypeTalent'],
  6: ['characteristicIncrease', 'firstArchetypeAbility'],
  7: ['characteristicIncrease', 'commonTalent'],
  8: ['firstArchetypeTalent', 'skillIncrease'],
  9: ['firearmMasteryUpgrade'],
  10: ['firstArchetypeTalent', 'characteristicIncrease'],
  11: ['firstArchetypeAbility', 'skillIncrease'],
  12: ['characteristicIncrease', 'commonTalent'],
  13: ['firstArchetypeTalent', 'commonTalent'],
  14: ['commonTalent', 'skillIncrease'],
  15: ['firearmMasteryUpgrade'],
}

const SMALL_FIRST_SCHEMA: Schema = {
  1: [keystone('runAndGun')],
  2: ['commonTalent', 'skillIncrease'],
}

const SECOND_SCHEMA: Schema = {
  16: ['secondArchetypeTalent'],
  17: ['characteristicIncrease', 'skillIncrease'],
  18: [keystone('masterTactician')],
}

const EXEMPLAR_SCHEMA: Schema = {
  36: ['exemplarArchetypeAbility'],
  37: ['firearmMasteryUpgrade'],
}

const SCHEMAS: ArchetypeSchemas = {
  first: new Map([
    [1, EXAMPLE_FIRST_SCHEMA],
    [3, SMALL_FIRST_SCHEMA],
  ]),
  second: new Map([[1, SECOND_SCHEMA]]),
  exemplar: EXEMPLAR_SCHEMA,
}

function build(overrides: Partial<BuildPlan>): BuildPlan {
  return { ...emptyBuildPlan(), ...overrides }
}

/** Writes raw fields, for links the encoder refuses to produce. */
function rawLink(fields: [value: number, width: number][]): string {
  const writer = new BitWriter()
  for (const [value, width] of fields) {
    writer.write(value, width)
  }
  return bitsToBase64url(writer.finish())
}

/** Version 1, then character, homeworld, origin, triumph, darkest hour and 6 starting increases, all null. */
const EMPTY_STATIC_FIELDS: [number, number][] = [
  [1, 4],
  [0, 5],
  [0, 4],
  [0, 5],
  ...Array<[number, number]>(8).fill([0, 4]),
]

/** A build that uses every section, with the largest value each field can hold. */
const FULL_BUILD = build({
  characterId: 31,
  homeworldId: 15,
  originId: 31,
  triumphId: 15,
  darkestHourId: 15,
  startingCharacteristicIncreasesIds: [9, 9, 8, 8, 7, 7],
  firstArchetypeId: 1,
  firstArchetypeChoicesIds: [13, 1023, 9, 1022, 8, 255, 7, 1021, 1020, 12, 4, 1019, 6, 254, 11, 5, 1018, 1017, 1016, 1015, 10, 3],
  secondArchetypeId: 1,
  secondArchetypeChoicesIds: [1023, 9, 13],
  isExemplar: true,
  exemplarArchetypeChoicesIds: [255, 4],
})

describe('codec', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  describe('known links', () => {
    // Worked out by hand from the stream order in Architecture §4.4. If one of these breaks, the
    // URL format changed, and the format version must be bumped (Architecture §4.1).
    it.each([
      { name: 'an empty build', link: 'E', plan: emptyBuildPlan() },
      { name: 'only a character', link: 'EI', plan: build({ characterId: 1 }) },
      {
        // 0001 00001 0010 00011 0000 0101 | 0001 0001 0010 0000 1001 0000 |
        // 0011 0100101100 1101 | 0000 | 1 11111111 100
        name: 'a build with every section',
        link: 'EJDBREgkDSzQ_8',
        plan: build({
          characterId: 1,
          homeworldId: 2,
          originId: 3,
          darkestHourId: 5,
          startingCharacteristicIncreasesIds: [1, 1, 2, null, 9, null],
          firstArchetypeId: 3,
          firstArchetypeChoicesIds: [300, 13],
          isExemplar: true,
          exemplarArchetypeChoicesIds: [255, 4],
        }),
      },
    ])('encodes and decodes $name', ({ link, plan }) => {
      expect(encodeBuild(plan, SCHEMAS)).toBe(link)
      expect(decodeBuild(link, SCHEMAS)).toEqual(plan)
    })
  })

  describe('round trip', () => {
    it.each([
      { name: 'a full build', plan: FULL_BUILD },
      {
        name: 'a build with nulls in the middle',
        plan: build({
          homeworldId: 4,
          startingCharacteristicIncreasesIds: [null, 3, null, null, 3, null],
          firstArchetypeId: 1,
          firstArchetypeChoicesIds: FULL_BUILD.firstArchetypeChoicesIds.map((id, index) => (index % 3 === 0 ? null : id)),
        }),
      },
      {
        name: 'a first archetype with no choices made',
        plan: build({ firstArchetypeId: 1, firstArchetypeChoicesIds: Array(22).fill(null) }),
      },
      {
        name: 'a second archetype without a first',
        plan: build({ secondArchetypeId: 1, secondArchetypeChoicesIds: [42, null, 2] }),
      },
      {
        name: 'an Exemplar without a second archetype',
        plan: build({ firstArchetypeId: 3, firstArchetypeChoicesIds: [1, null], isExemplar: true, exemplarArchetypeChoicesIds: [null, 1] }),
      },
    ])('decodes $name back to the same build', ({ plan }) => {
      expect(decodeBuild(encodeBuild(plan, SCHEMAS), SCHEMAS)).toEqual(plan)
      expect(warn).not.toHaveBeenCalled()
    })

    it('decodes the example schema into 22 choices', () => {
      const plan = build({ firstArchetypeId: 1, firstArchetypeChoicesIds: Array(22).fill(null) })
      expect(decodeBuild(encodeBuild(plan, SCHEMAS), SCHEMAS).firstArchetypeChoicesIds).toHaveLength(22)
    })
  })

  describe('trailing nulls', () => {
    it('drops trailing all-zero characters from the link', () => {
      const link = encodeBuild(build({ firstArchetypeId: 3, firstArchetypeChoicesIds: [null, null] }), SCHEMAS)
      expect(link).not.toMatch(/A$/)
    })

    it('decodes the same build with or without trailing zero characters', () => {
      expect(decodeBuild('EIAAAAAAAAAAAA', SCHEMAS)).toEqual(decodeBuild('EI', SCHEMAS))
    })

    it('reads a link cut short as nulls for the missing fields', () => {
      // 3 characters = 18 bits: exactly the version, character, homeworld and origin.
      const link = encodeBuild(build({ ...FULL_BUILD, triumphId: null }), SCHEMAS)
      const plan = decodeBuild(link.slice(0, 3), SCHEMAS)
      expect(plan).toEqual(build({ characterId: 31, homeworldId: 15, originId: 31 }))
    })
  })

  describe('decoding does not validate', () => {
    it('keeps an ID that fits its field even if no such entry exists', () => {
      const plan = build({ triumphId: 14, startingCharacteristicIncreasesIds: [15, 15, 15, null, null, null] })
      expect(decodeBuild(encodeBuild(plan, SCHEMAS), SCHEMAS)).toEqual(plan)
    })
  })

  describe('unknown archetype IDs', () => {
    it('stops at an unknown first archetype and leaves everything after it empty', () => {
      // Static fields, first archetype 14, then bits that would otherwise be read as choices.
      const link = rawLink([...EMPTY_STATIC_FIELDS, [14, 4], [0b1111111111, 10], [1, 4], [1, 1]])
      expect(decodeBuild(link, SCHEMAS)).toEqual(emptyBuildPlan())
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0][0]).toContain('first archetype ID 14')
    })

    it('stops at an unknown second archetype and keeps the first', () => {
      const link = rawLink([...EMPTY_STATIC_FIELDS, [3, 4], [7, 10], [2, 4], [9, 4], [1, 1]])
      expect(decodeBuild(link, SCHEMAS)).toEqual(
        build({ firstArchetypeId: 3, firstArchetypeChoicesIds: [7, 2] }),
      )
      expect(warn.mock.calls[0][0]).toContain('second archetype ID 9')
    })
  })

  describe('links that cannot be decoded', () => {
    it.each([
      { name: 'an empty link', link: '', version: 0 },
      { name: 'version 0', link: rawLink([[0, 4], [1, 4]]), version: 0 },
      { name: 'version 2', link: rawLink([[2, 4]]), version: 2 },
    ])('rejects $name as an unsupported version', ({ link, version }) => {
      expect(() => decodeBuild(link, SCHEMAS)).toThrow(new DecodeError(`Unsupported format version: ${version}`))
    })

    it('rejects a character outside base64url', () => {
      expect(() => decodeBuild('E+Q', SCHEMAS)).toThrow(DecodeError)
    })
  })

  describe('malformed builds are not encoded', () => {
    it.each([
      { name: 'an ID too large for its field', plan: build({ homeworldId: 16 }) },
      { name: 'ID 0', plan: build({ originId: 0 }) },
      { name: 'a talent ID over 1023', plan: build({ firstArchetypeId: 3, firstArchetypeChoicesIds: [1024, null] }) },
      { name: '5 starting increases', plan: build({ startingCharacteristicIncreasesIds: Array(5).fill(null) }) },
      { name: 'an unknown first archetype', plan: build({ firstArchetypeId: 14 }) },
      { name: 'too few choices for the schema', plan: build({ firstArchetypeId: 3, firstArchetypeChoicesIds: [null] }) },
      { name: 'too many choices for the schema', plan: build({ firstArchetypeId: 3, firstArchetypeChoicesIds: [1, 2, 3] }) },
      { name: 'choices without a second archetype', plan: build({ secondArchetypeChoicesIds: [1] }) },
      { name: 'Exemplar choices without the Exemplar', plan: build({ exemplarArchetypeChoicesIds: [null, null] }) },
    ])('throws for $name', ({ plan }) => {
      expect(() => encodeBuild(plan, SCHEMAS)).toThrow()
    })
  })
})
