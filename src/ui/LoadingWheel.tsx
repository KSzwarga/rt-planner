import type { CSSProperties } from 'react'
import { SCREEN_TRANSITION_MS } from './useScreenTransition'
import './LoadingWheel.css'

/**
 * A wheel, centred on the page, shown briefly between screens (`useScreenTransition`). It turns once,
 * over exactly as long as it shows.
 */
export function LoadingWheel() {
  const style = { '--loading-wheel-turn': `${SCREEN_TRANSITION_MS}ms` } as CSSProperties
  return (
    <div className="loading-wheel" role="status" style={style}>
      <span className="loading-wheel__ring" aria-hidden="true" />
      <span className="loading-wheel__label">Loading</span>
    </div>
  )
}
