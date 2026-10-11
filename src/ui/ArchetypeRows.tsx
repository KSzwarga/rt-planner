import { type ReactNode, useState } from 'react'
import { availableSecondArchetypeIds } from '../availability/archetypes'
import type { ArchetypeTier } from '../availability/characterState'
import { EXEMPLAR } from '../gamedata/exemplar'
import { FIRST_ARCHETYPES } from '../gamedata/firstArchetypes'
import { SECOND_ARCHETYPES } from '../gamedata/secondArchetypes'
import type { BuildPlan } from '../model/buildPlan'
import { selectFirstArchetype, selectSecondArchetype, setExemplar, undoesEarlierChoices } from './archetypeEdits'
import { ConfirmDialog } from './ConfirmDialog'
import './ArchetypeRows.css'

interface ArchetypeRowsProps {
  readonly build: BuildPlan
  readonly onChange: (change: Partial<BuildPlan>) => void
  /** Opens the level-up screen of one of the build's archetypes. */
  readonly onOpenLevelUp: (tier: ArchetypeTier) => void
}

/** A selection waiting for the user to confirm it, and the level-up screen to open after it. */
interface PendingSwitch {
  readonly change: Partial<BuildPlan>
  readonly tier: ArchetypeTier
}

/**
 * The three archetype rows of the archetype pick screen (UI Design: Archetype rows). Clicking an
 * archetype selects it and opens its level-up screen. Clicking the selected one just opens it. The
 * user may change the second archetype only to one the first allows, and the Exemplar only once a
 * second archetype is selected (Architecture §6: Validation vs. editing).
 *
 * A switch that would undo earlier choices waits for the user to confirm it (`undoesEarlierChoices`).
 */
export function ArchetypeRows({ build, onChange, onOpenLevelUp }: ArchetypeRowsProps) {
  const [pending, setPending] = useState<PendingSwitch | null>(null)

  /** Applies the selection, unless it needs confirming first, then opens the level-up screen. */
  function selectAndOpen(change: Partial<BuildPlan>, tier: ArchetypeTier) {
    if (undoesEarlierChoices(build, change)) {
      setPending({ change, tier })
      return
    }
    if (Object.keys(change).length > 0) onChange(change)
    onOpenLevelUp(tier)
  }

  const firstArchetype = FIRST_ARCHETYPES.find((entry) => entry.id === build.firstArchetypeId) ?? null
  const allowedSecondIds = availableSecondArchetypeIds(firstArchetype)
  const isExemplarLocked = build.secondArchetypeId === null

  return (
    <div className="archetype-rows">
      <ArchetypeRow label="First archetype" isLocked={false}>
        {FIRST_ARCHETYPES.map((archetype) => {
          const isSelected = archetype.id === build.firstArchetypeId
          return (
            <ArchetypeButton
              key={archetype.id}
              archetype={archetype}
              isSelected={isSelected}
              isLocked={false}
              onClick={() => selectAndOpen(selectFirstArchetype(build, archetype.id), 'first')}
            />
          )
        })}
      </ArchetypeRow>

      <ArchetypeRow label="Second archetype" isLocked={allowedSecondIds.length === 0} isCompact>
        {SECOND_ARCHETYPES.map((archetype) => {
          const isSelected = archetype.id === build.secondArchetypeId
          return (
            <ArchetypeButton
              key={archetype.id}
              archetype={archetype}
              isSelected={isSelected}
              isLocked={!allowedSecondIds.includes(archetype.id)}
              onClick={() => selectAndOpen(selectSecondArchetype(build, archetype.id), 'second')}
            />
          )
        })}
      </ArchetypeRow>

      <ArchetypeRow label="Exemplar" isLocked={isExemplarLocked} isExemplar>
        <Wing />
        <ArchetypeButton
          archetype={EXEMPLAR}
          isSelected={build.isExemplar}
          isLocked={isExemplarLocked}
          onClick={() => selectAndOpen(setExemplar(build, true), 'exemplar')}
        />
        <Wing isMirrored />
      </ArchetypeRow>

      <ConfirmDialog
        isOpen={pending !== null}
        message="Switching archetype might undo some of your previous choices, do you want to proceed?"
        confirmLabel="Proceed"
        onConfirm={() => {
          if (pending) {
            onChange(pending.change)
            onOpenLevelUp(pending.tier)
          }
          setPending(null)
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}

interface ArchetypeRowProps {
  readonly label: string
  /** A row is drawn locked (red) when none of its archetypes can be picked. */
  readonly isLocked: boolean
  /** Tighter spacing, so the seven second archetypes fit on one line, as in the mock-up. */
  readonly isCompact?: boolean
  readonly isExemplar?: boolean
  readonly children: ReactNode
}

function ArchetypeRow({ label, isLocked, isCompact = false, isExemplar = false, children }: ArchetypeRowProps) {
  const classNames = ['archetype-row']
  if (isLocked) classNames.push('archetype-row--locked')
  if (isCompact) classNames.push('archetype-row--compact')
  if (isExemplar) classNames.push('archetype-row--exemplar')

  return (
    <div className={classNames.join(' ')} role="group" aria-label={label}>
      {children}
    </div>
  )
}

interface ArchetypeButtonProps {
  readonly archetype: { readonly name: string; readonly abbreviation: string }
  readonly isSelected: boolean
  /** Locked archetypes can't be picked. One loaded from a link still shows as selected. */
  readonly isLocked: boolean
  readonly onClick: () => void
}

function ArchetypeButton({ archetype, isSelected, isLocked, onClick }: ArchetypeButtonProps) {
  const classNames = ['archetype']
  if (isSelected) classNames.push('archetype--selected')
  if (isLocked) classNames.push('archetype--locked')

  return (
    <button type="button" className={classNames.join(' ')} aria-pressed={isSelected} disabled={isLocked} onClick={onClick}>
      {/* Placeholder emblem: the mock-up's icons are concepts, so it shows the abbreviation for now. */}
      <span className="archetype__emblem" aria-hidden="true">
        {archetype.abbreviation}
      </span>
      <span className="archetype__name">{archetype.name}</span>
    </button>
  )
}

/** The decorative lines beside the Exemplar emblem, as in the mock-up. */
function Wing({ isMirrored = false }: { readonly isMirrored?: boolean }) {
  return (
    <svg
      className={isMirrored ? 'archetype-row__wing archetype-row__wing--mirrored' : 'archetype-row__wing'}
      viewBox="0 0 130 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 1.5h118l8 7H8z M22 15.5h96l-6 7H30z" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
