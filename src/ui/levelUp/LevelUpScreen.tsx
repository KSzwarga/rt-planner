import { useMemo, useState } from 'react'
import type { ArchetypeTier } from '../../availability/characterState'
import { EXEMPLAR } from '../../gamedata/exemplar'
import { KEYSTONE_FEATURES } from '../../gamedata/keystoneFeatures'
import type { ArchetypeEntry } from '../../gamedata/types'
import type { BuildPlan, Id } from '../../model/buildPlan'
import { isKeystoneFeature } from '../../model/slotKinds'
import { CHOICES_FIELD } from '../../validation/replay'
import { GAME_TABLES } from '../../validation/validator'
import { type DetailView, DetailPanel } from './DetailPanel'
import { OptionList } from './OptionList'
import { type NodeSelection, RadialProgression } from './RadialProgression'
import { radialLayout } from './radialLayout'
import { choiceSlotView, type OptionView, tierSchema } from './slotView'
import './LevelUpScreen.css'

interface LevelUpScreenProps {
  readonly build: BuildPlan
  readonly tier: ArchetypeTier
  readonly onChange: (change: Partial<BuildPlan>) => void
  readonly onReturn: () => void
}

const TIER_HEADINGS: Record<ArchetypeTier, string> = {
  first: 'Loadout // Archetype 01',
  second: 'Loadout // Archetype 02',
  exemplar: 'Loadout // Exemplar',
}

/**
 * The level-up screen of one archetype (UI Design: Level-up screen): its progression ring, the
 * options of the open slot, and the details of the option under the cursor. Every slot can be
 * opened in any order. What it offers depends only on the choices before it, and every pick goes
 * through the validator, so later choices that no longer hold are nulled.
 */
export function LevelUpScreen({ build, tier, onChange, onReturn }: LevelUpScreenProps) {
  const schema = tierSchema(build, tier)
  if (schema === null) throw new Error(`The build has no ${tier} archetype`)

  const nodes = useMemo(() => radialLayout(schema), [schema])
  const firstChoiceIndex = nodes.some((node) => node.choiceIndex !== null) ? 0 : null
  const [selection, setSelection] = useState<NodeSelection | null>(
    firstChoiceIndex === null ? null : { type: 'choice', index: firstChoiceIndex },
  )
  const [hovered, setHovered] = useState<OptionView | null>(null)

  const choices = build[CHOICES_FIELD[tier]]
  const view = selection?.type === 'choice' ? choiceSlotView(build, tier, selection.index) : null
  const keystone = selection?.type === 'keystone' ? keystoneDetail(nodes, selection) : null

  function select(next: NodeSelection) {
    setSelection(next)
    setHovered(null)
  }

  function pick(id: Id | null) {
    if (selection?.type !== 'choice') return
    const next = [...choices]
    next[selection.index] = id
    onChange({ [CHOICES_FIELD[tier]]: next })
  }

  const detail: DetailView | null = keystone ?? optionDetail(hovered ?? view?.current ?? null)

  return (
    <main className="level-up">
      <h1 className="level-up__title">{TIER_HEADINGS[tier]}</h1>

      <div className="level-up__ring">
        <RadialProgression
          schema={schema}
          choices={choices}
          archetype={archetypeShown(build, tier)}
          selection={selection}
          onSelect={select}
        />
        <button type="button" className="level-up__return" onClick={onReturn}>
          <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
            <path d="M7.5 3 4.5 6l3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Return
        </button>
      </div>

      <OptionList
        title={view?.title ?? (keystone ? 'Keystone feature' : 'Options')}
        groups={view?.groups ?? []}
        emptyMessage={
          keystone
            ? 'Keystone features are fixed by the archetype and cannot be changed.'
            : nodes.length === 0
              ? "This archetype's progression isn't defined yet."
              : 'Pick a node on the ring to see its options.'
        }
        onPick={pick}
        onHover={setHovered}
      />

      <DetailPanel detail={detail} />
    </main>
  )
}

/** The archetype being levelled up, as its emblem shows it. */
function archetypeShown(build: BuildPlan, tier: ArchetypeTier): Pick<ArchetypeEntry, 'name' | 'icon'> {
  if (tier === 'exemplar') return EXEMPLAR
  const archetype =
    tier === 'first'
      ? GAME_TABLES.firstArchetypes.find((entry) => entry.id === build.firstArchetypeId)
      : GAME_TABLES.secondArchetypes.find((entry) => entry.id === build.secondArchetypeId)
  if (!archetype) throw new Error(`The build has no ${tier} archetype`)
  return archetype
}

function optionDetail(option: OptionView | null): DetailView | null {
  if (option === null) return null
  return {
    name: option.name,
    abbreviation: option.abbreviation,
    typeLabel: option.typeLabel,
    description: option.description,
    problems: option.problems,
    isLocked: !option.selectable,
  }
}

function keystoneDetail(
  nodes: ReturnType<typeof radialLayout>,
  selection: Extract<NodeSelection, { type: 'keystone' }>,
): DetailView | null {
  const node = nodes.find((candidate) => candidate.level === selection.level && candidate.ring === selection.ring)
  if (!node || !isKeystoneFeature(node.slot)) return null
  const feature = KEYSTONE_FEATURES[node.slot.featureKey as keyof typeof KEYSTONE_FEATURES]
  return {
    name: feature?.name ?? node.slot.featureKey,
    abbreviation: feature?.abbreviation ?? '?',
    typeLabel: feature?.isUltimate ? `Ultimate · level ${node.level}` : `Keystone feature · level ${node.level}`,
    description: '',
    problems: [],
    isLocked: false,
  }
}
