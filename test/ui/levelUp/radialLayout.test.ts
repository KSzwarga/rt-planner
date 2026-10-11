import { describe, expect, it } from 'vitest'
import { FIRST_ARCHETYPES } from '../../../src/gamedata/firstArchetypes'
import { SECOND_ARCHETYPES } from '../../../src/gamedata/secondArchetypes'
import type { Schema } from '../../../src/model/schema'
import { nodePosition, radialLayout } from '../../../src/ui/levelUp/radialLayout'

const keystone = { kind: 'keystoneFeature', featureKey: 'runAndGun' } as const

describe('radialLayout', () => {
  const schema: Schema = {
    1: [keystone],
    2: ['skillIncrease'],
    3: ['characteristicIncrease', 'commonTalent'],
    4: ['firstArchetypeTalent'],
  }

  it('gives each level its own angle, evenly spaced clockwise from 12 o’clock', () => {
    const angles = radialLayout(schema).map((node) => [node.level, node.angle])
    expect(angles).toEqual([
      [1, 0],
      [2, 90],
      [3, 180],
      [3, 180],
      [4, 270],
    ])
  })

  it("puts a level's slots on the same angle, outward in", () => {
    const level3 = radialLayout(schema).filter((node) => node.level === 3)
    expect(level3.map((node) => [node.ring, node.slot])).toEqual([
      [0, 'characteristicIncrease'],
      [1, 'commonTalent'],
    ])
  })

  it('numbers the choice slots as choiceSlots does, skipping keystone features', () => {
    expect(radialLayout(schema).map((node) => node.choiceIndex)).toEqual([null, 0, 1, 2, 3])
  })

  it.each([...FIRST_ARCHETYPES, ...SECOND_ARCHETYPES].map((archetype) => [archetype.name, archetype.schema] as const))(
    "lays out %s's schema",
    (_, archetypeSchema) => {
      expect(() => radialLayout(archetypeSchema)).not.toThrow()
    },
  )
})

describe('nodePosition', () => {
  it('places 12 o’clock above the centre and 3 o’clock to its right', () => {
    expect(nodePosition({ ring: 0, angle: 0 })).toEqual({ x: 50, y: 7 })
    const right = nodePosition({ ring: 0, angle: 90 })
    expect(right.x).toBeCloseTo(93)
    expect(right.y).toBeCloseTo(50)
  })
})
