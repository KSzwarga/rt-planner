import type { Schema } from '../../model/schema'
import { isKeystoneFeature, type SchemaSlot } from '../../model/slotKinds'

/** One node of the radial progression. */
export interface RadialNode {
  readonly level: number
  /** 0 for the outer ring, then inward. A level's slots go outward in. */
  readonly ring: number
  /** Degrees clockwise from 12 o'clock. Every slot of a level shares its level's angle. */
  readonly angle: number
  readonly slot: SchemaSlot
  /** The slot's index in the choices array, or null for a keystone feature. */
  readonly choiceIndex: number | null
}

/**
 * Ring radii, as a percentage of the ring's width, far enough apart for nodes of one size. Most levels
 * use the outer two, as in the mock-up. The third is for the few levels with three slots, such as
 * the Bounty Hunter's level 20.
 */
export const RING_RADII: readonly number[] = [43, 34, 25.5]

/**
 * Lays a schema out as a ring (UI Design: Radial progression): one angle per level, in level order
 * clockwise from 12 o'clock, evenly spaced. A level's slots share its angle: the first on the outer
 * ring, the next ones further in. Choice indexes follow `choiceSlots`.
 */
export function radialLayout(schema: Schema): RadialNode[] {
  const levels = Object.keys(schema)
    .map(Number)
    .sort((a, b) => a - b)
  const nodes: RadialNode[] = []
  let choiceIndex = 0
  levels.forEach((level, levelIndex) => {
    const angle = (levelIndex * 360) / levels.length
    schema[level].forEach((slot, ring) => {
      if (ring >= RING_RADII.length) throw new Error(`Level ${level} has more slots than the ring can show`)
      nodes.push({ level, ring, angle, slot, choiceIndex: isKeystoneFeature(slot) ? null : choiceIndex++ })
    })
  })
  return nodes
}

/** A node's centre, in percent of the ring's width and height. */
export function nodePosition(node: Pick<RadialNode, 'ring' | 'angle'>): { x: number; y: number } {
  const radians = (node.angle * Math.PI) / 180
  const radius = RING_RADII[node.ring]
  return { x: 50 + radius * Math.sin(radians), y: 50 - radius * Math.cos(radians) }
}
