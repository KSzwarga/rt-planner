import './DetailPanel.css'

/** What the detail panel shows: an option, or a keystone feature. */
export interface DetailView {
  readonly name: string
  readonly abbreviation: string
  readonly typeLabel: string
  readonly description: string
  /** Unmet requirements and other reasons it can't be picked. Shown in the red box. */
  readonly problems: readonly string[]
  readonly isLocked: boolean
}

interface DetailPanelProps {
  readonly detail: DetailView | null
}

/** The option under the cursor or the current choice (UI Design: Detail panel). */
export function DetailPanel({ detail }: DetailPanelProps) {
  if (detail === null) {
    return (
      <section className="detail" aria-label="Details">
        <p className="detail__empty">Select an option to see what it does.</p>
      </section>
    )
  }

  return (
    <section className="detail" aria-label="Details">
      <header className="detail__header">
        <span className={detail.isLocked ? 'detail__icon detail__icon--locked' : 'detail__icon'} aria-hidden="true">
          {detail.abbreviation}
        </span>
        <div>
          <h2 className="detail__name">{detail.name}</h2>
          <p className="detail__type">{detail.typeLabel}</p>
        </div>
      </header>
      {detail.description && <p className="detail__description">{detail.description}</p>}
      {detail.problems.length > 0 && (
        <div className="detail__requirements" role="note" aria-label="Requirements">
          <h3 className="detail__requirements-title">Requirements</h3>
          <ul>
            {detail.problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
