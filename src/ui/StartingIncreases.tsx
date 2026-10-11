import { countStartingIncreases, MAX_STARTING_INCREASES_PER_CHARACTERISTIC } from '../availability/startingIncreases'
import type { CharacteristicEntry } from '../gamedata/types'
import type { Id } from '../model/buildPlan'
import { canAddStartingIncrease, cycleStartingIncrease } from './startingIncreaseEdits'
import './StartingIncreases.css'

interface StartingIncreasesProps {
  readonly characteristics: readonly CharacteristicEntry[]
  readonly ids: readonly (Id | null)[]
  readonly onChange: (ids: (Id | null)[]) => void
}

const PIPS = Array.from({ length: MAX_STARTING_INCREASES_PER_CHARACTERISTIC }, (_, index) => index)

/**
 * One cell per characteristic, with a pip for each time it is taken among the starting increases
 * (UI Design: Starting characteristic increases). Clicking a cell cycles it, see `cycleStartingIncrease`.
 */
export function StartingIncreases({ characteristics, ids, onChange }: StartingIncreasesProps) {
  const takenCount = ids.filter((id) => id !== null).length

  return (
    <div className="starting-increases" role="group" aria-label={`Starting characteristic increases, ${takenCount} of ${ids.length} used`}>
      {characteristics.map((characteristic) => {
        const count = countStartingIncreases(ids, characteristic.id)
        const canAdd = canAddStartingIncrease(ids, characteristic.id, characteristics)
        const className = count > 0 ? 'starting-increases__cell starting-increases__cell--taken' : 'starting-increases__cell'

        return (
          <button
            key={characteristic.id}
            type="button"
            className={className}
            aria-label={`${characteristic.name}: ${count} of ${MAX_STARTING_INCREASES_PER_CHARACTERISTIC}`}
            disabled={count === 0 && !canAdd}
            onClick={() => onChange(cycleStartingIncrease(ids, characteristic.id, characteristics))}
          >
            <span className="starting-increases__abbreviation">{characteristic.abbreviation}</span>
            <span className="starting-increases__pips" aria-hidden="true">
              {PIPS.map((pip) => (
                <span
                  key={pip}
                  className={pip < count ? 'starting-increases__pip starting-increases__pip--filled' : 'starting-increases__pip'}
                />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
