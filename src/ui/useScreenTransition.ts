import { useCallback, useEffect, useRef, useState } from 'react'

/** How long the loading wheel shows between screens, in milliseconds (UI Design: Screens). */
export const SCREEN_TRANSITION_MS = 400

/** The open screen, whether the loading wheel is showing instead of it, and how to open another. */
export interface ScreenTransition<S> {
  readonly screen: S
  readonly isLoading: boolean
  readonly openScreen: (next: S) => void
}

/**
 * Which screen is open, changed through a brief loading wheel: `openScreen` shows the wheel at once,
 * then opens the screen after `SCREEN_TRANSITION_MS`. Opening another screen while the wheel shows
 * restarts it, and the last one asked for opens.
 */
export function useScreenTransition<S>(initial: S): ScreenTransition<S> {
  const [screen, setScreen] = useState(initial)
  const [isLoading, setIsLoading] = useState(false)
  const timeout = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeout.current), [])

  const openScreen = useCallback((next: S) => {
    window.clearTimeout(timeout.current)
    setIsLoading(true)
    timeout.current = window.setTimeout(() => {
      setScreen(next)
      setIsLoading(false)
    }, SCREEN_TRANSITION_MS)
  }, [])

  return { screen, isLoading, openScreen }
}
