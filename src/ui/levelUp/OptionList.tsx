import { Fragment } from 'react'
import type { Id } from '../../model/buildPlan'
import type { OptionGroup, OptionView } from './slotView'
import './OptionList.css'

interface OptionListProps {
  readonly title: string
  readonly groups: readonly OptionGroup[]
  /** Shown when there is nothing to pick, such as for a keystone feature. */
  readonly emptyMessage: string
  readonly onPick: (id: Id | null) => void
  readonly onHover: (option: OptionView | null) => void
}

/**
 * The options of the open slot (UI Design: Option list), one group per list with a divider between
 * groups. Options that can't be picked are shown in red. Clicking the current choice clears it.
 */
export function OptionList({ title, groups, emptyMessage, onPick, onHover }: OptionListProps) {
  const hasOptions = groups.some((group) => group.options.length > 0)

  return (
    <section className="option-list" aria-label={title} onMouseLeave={() => onHover(null)}>
      <h2 className="option-list__title">{title}</h2>
      {hasOptions ? (
        <div className="option-list__scroll">
          {groups.map((group, index) => (
            <Fragment key={group.key}>
              {index > 0 && (
                <div className="option-list__divider" aria-hidden="true">
                  <span />
                </div>
              )}
              <ul className="option-list__group" aria-label={group.name}>
                {group.options.map((option) => (
                  <li key={option.id}>
                    <OptionButton option={option} onPick={onPick} onHover={onHover} />
                  </li>
                ))}
              </ul>
            </Fragment>
          ))}
        </div>
      ) : (
        <p className="option-list__empty">{emptyMessage}</p>
      )}
    </section>
  )
}

interface OptionButtonProps {
  readonly option: OptionView
  readonly onPick: (id: Id | null) => void
  readonly onHover: (option: OptionView | null) => void
}

function OptionButton({ option, onPick, onHover }: OptionButtonProps) {
  const classNames = ['option', option.selectable ? 'option--selectable' : 'option--locked']
  if (option.isCurrent) classNames.push('option--current')

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      aria-pressed={option.isCurrent}
      aria-disabled={!option.selectable}
      onClick={() => {
        if (option.isCurrent) onPick(null)
        else if (option.selectable) onPick(option.id)
      }}
      onMouseEnter={() => onHover(option)}
      onFocus={() => onHover(option)}
    >
      <span className="option__icon" aria-hidden="true">
        {option.abbreviation}
      </span>
      <span className="option__name">{option.name}</span>
    </button>
  )
}
