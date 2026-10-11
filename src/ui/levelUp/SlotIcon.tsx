import type { ReactNode } from 'react'
import type { SlotCategory } from './slotView'

/** An 8-pointed star in the 24 × 24 icon box. */
const STAR =
  '12,2 14.14,6.83 19.07,4.93 17.17,9.86 22,12 17.17,14.14 19.07,19.07 14.14,17.17 12,22 9.86,17.17 4.93,19.07 6.83,14.14 2,12 6.83,9.86 4.93,4.93 9.86,6.83'

/** The common talent's star: smaller and lower, under its ^. */
const LOW_STAR =
  '12,6.50 13.72,10.34 17.66,8.84 16.16,12.78 20,14.50 16.16,16.22 17.66,20.16 13.72,18.66 12,22.50 10.28,18.66 6.34,20.16 7.84,16.22 4,14.50 7.84,12.78 6.34,8.84 10.28,10.34'

/** The icon of each slot category that has one. Abilities show their label instead. */
const ICONS: Partial<Record<SlotCategory, ReactNode>> = {
  talent: <polygon points={STAR} />,
  commonTalent: (
    <>
      <polygon points={LOW_STAR} />
      <polyline points="9,4.6 12,1.8 15,4.6" />
    </>
  ),
  upgrade: (
    <>
      <path d="M4 17.5 3 7.5l5 4.5 4-6.5 4 6.5 5-4.5-1 10z" />
      <path d="M4.5 20.5h15" />
    </>
  ),
  skill: (
    <>
      <path d="M12 6.5C10 4.8 7 4.5 3.5 5v13c3.5-.5 6.5-.2 8.5 1.5 2-1.7 5-2 8.5-1.5V5C17 4.5 14 4.8 12 6.5z" />
      <path d="M12 6.5v13" />
    </>
  ),
  // A flexed arm: elbow bottom left, fist up, biceps bulging towards the shoulder on the right.
  characteristic: (
    <path d="M21 20H7c-2.9 0-4.2-2.2-3.4-4.4L5.5 8c.4-2.3 2-4 4.1-3.8 2 .2 2.8 2.1 1.8 3.6L9.8 11.2c1.8-2.6 6.7-2.8 8.8-.2.9 1.1 1.6 1.9 2.4 2.2z" />
  ),
}

interface SlotIconProps {
  readonly category: SlotCategory
  /** Shown instead, for a category without an icon. */
  readonly fallback: string
}

/**
 * The line icon of an empty slot on the ring. It takes the text colour, so the node's CSS sets its
 * colour: gray when empty.
 */
export function SlotIcon({ category, fallback }: SlotIconProps) {
  if (!(category in ICONS)) return fallback
  return (
    <svg className="slot-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {ICONS[category]}
    </svg>
  )
}
