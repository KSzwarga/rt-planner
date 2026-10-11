import type { ReactNode } from 'react'
import { KEYSTONE_FEATURES } from '../../gamedata/keystoneFeatures'
import type { Choice } from '../../model/buildPlan'
import type { Schema } from '../../model/schema'
import { isKeystoneFeature } from '../../model/slotKinds'
import { nodePosition, RING_RADII, type RadialNode, radialLayout } from './radialLayout'
import { SlotIcon } from './SlotIcon'
import { choiceEntry, type SlotCategory, slotCategory, slotTitle } from './slotView'
import './RadialProgression.css'

/** Which node is open: a choice slot by its index, or a keystone feature by its level and ring. */
export type NodeSelection =
  | { readonly type: 'choice'; readonly index: number }
  | { readonly type: 'keystone'; readonly level: number; readonly ring: number }

interface RadialProgressionProps {
  readonly schema: Schema
  readonly choices: readonly (Choice | null)[]
  /** The archetype at the centre of the ring. */
  readonly archetype: { readonly name: string; readonly abbreviation: string }
  readonly selection: NodeSelection | null
  readonly onSelect: (selection: NodeSelection) => void
}

/**
 * The archetype's schema as a ring around its emblem (UI Design: Radial progression). One node
 * per slot: choices show what was picked, keystone features are fixed. Two slots of one level
 * share an angle and are joined by a line.
 */
export function RadialProgression({ schema, choices, archetype, selection, onSelect }: RadialProgressionProps) {
  const nodes = radialLayout(schema)
  const selectedLevel = nodes.find((node) => isSelected(node, selection))?.level
  const usedRings = [...new Set(nodes.map((node) => node.ring))]

  return (
    <div className="radial">
      <svg className="radial__decor" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        {usedRings.map((ring) => (
          <circle key={ring} className="radial__track" cx="50" cy="50" r={RING_RADII[ring]} />
        ))}
        <circle className="radial__halo" cx="50" cy="50" r="23.5" />
        <circle className="radial__ticks" cx="50" cy="50" r="27.5" />
        <circle className="radial__ring" cx="50" cy="50" r="21" />
        <circle className="radial__ring-inner" cx="50" cy="50" r="18.6" />
        <path className="radial__arc" d="M 38.69 38.69 A 16 16 0 0 0 38.69 61.31" />
        <path className="radial__arc" d="M 61.31 38.69 A 16 16 0 0 1 61.31 61.31" />
        {nodes
          .filter((node) => node.ring > 0)
          .map((inner) => {
            const from = nodePosition({ ring: inner.ring - 1, angle: inner.angle })
            const to = nodePosition(inner)
            return (
              <line
                key={`${inner.level}-${inner.ring}`}
                className="radial__link"
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
              />
            )
          })}
      </svg>

      <div className="radial__centre">
        <svg className="radial__emblem" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" />
          <text x="50" y="50" dominantBaseline="central" textAnchor="middle">
            {archetype.abbreviation}
          </text>
        </svg>
        <p className="radial__name">{archetype.name}</p>
        {selectedLevel !== undefined && <p className="radial__level">Level {selectedLevel}</p>}
      </div>

      {nodes.map((node) => (
        <RadialNodeButton
          key={`${node.level}-${node.ring}`}
          node={node}
          choice={node.choiceIndex === null ? null : (choices[node.choiceIndex] ?? null)}
          isSelected={isSelected(node, selection)}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

interface RadialNodeButtonProps {
  readonly node: RadialNode
  readonly choice: Choice | null
  readonly isSelected: boolean
  readonly onSelect: (selection: NodeSelection) => void
}

function RadialNodeButton({ node, choice, isSelected, onSelect }: RadialNodeButtonProps) {
  const { x, y } = nodePosition(node)
  const classNames = ['radial-node']
  if (isSelected) classNames.push('radial-node--selected')

  let label: ReactNode
  let accessibleName: string
  let category: SlotCategory | 'keystone'
  if (isKeystoneFeature(node.slot)) {
    const feature = KEYSTONE_FEATURES[node.slot.featureKey as keyof typeof KEYSTONE_FEATURES]
    const name = feature?.name ?? node.slot.featureKey
    category = 'keystone'
    label = feature?.abbreviation ?? '?'
    accessibleName = `Level ${node.level} keystone feature: ${name}`
  } else if (choice === null) {
    category = slotCategory(node.slot)
    classNames.push('radial-node--empty')
    // Abilities have no icon, so an empty one shows its label.
    label = <SlotIcon category={category} fallback="ABL" />
    accessibleName = `Level ${node.level} ${slotTitle(node.slot)}: empty`
  } else {
    const entry = choiceEntry(node.slot, choice)
    category = slotCategory(node.slot)
    classNames.push('radial-node--filled')
    label = entry.abbreviation
    accessibleName = `Level ${node.level} ${slotTitle(node.slot)}: ${entry.name}`
  }

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      data-category={category}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={accessibleName}
      aria-current={isSelected ? 'true' : undefined}
      title={accessibleName}
      onClick={() =>
        onSelect(
          node.choiceIndex === null
            ? { type: 'keystone', level: node.level, ring: node.ring }
            : { type: 'choice', index: node.choiceIndex },
        )
      }
    >
      {label}
    </button>
  )
}

function isSelected(node: RadialNode, selection: NodeSelection | null): boolean {
  if (selection === null) return false
  return selection.type === 'choice'
    ? node.choiceIndex === selection.index
    : node.choiceIndex === null && node.level === selection.level && node.ring === selection.ring
}
