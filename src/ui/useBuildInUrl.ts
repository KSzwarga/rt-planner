import { useEffect, useState } from 'react'
import type { BuildPlan } from '../model/buildPlan'
import { buildFromHash, hashFromBuild } from '../url/buildUrl'
import { validateBuild } from '../validation/validator'

/**
 * The build, kept in the URL's `#` fragment. It is read from the link on load and whenever the
 * fragment changes, such as when a link is pasted into the address bar of an open page.
 *
 * `update` follows the edit path of Architecture §6: apply change → validate → store state →
 * encode to URL. The URL is only written by an edit or by reading a link, never by rendering, so
 * a link opened while the page starts up can't be overwritten.
 */
export function useBuildInUrl(): [BuildPlan, (change: Partial<BuildPlan>) => void] {
  const [build, setBuild] = useState(() => buildFromHash(window.location.hash))

  useEffect(() => {
    function loadFromUrl() {
      const loaded = buildFromHash(window.location.hash)
      setBuild(loaded)
      // A link with illegal selections is rewritten without them.
      replaceHash(hashFromBuild(loaded))
    }

    // Read again here, in case the fragment changed between the first render and this listener.
    loadFromUrl()
    window.addEventListener('hashchange', loadFromUrl)
    return () => window.removeEventListener('hashchange', loadFromUrl)
  }, [])

  function update(change: Partial<BuildPlan>) {
    const next = validateBuild({ ...build, ...change })
    setBuild(next)
    replaceHash(hashFromBuild(next))
  }

  return [build, update]
}

/** Replaces the URL's fragment without adding a history entry, so Back leaves the planner. */
function replaceHash(hash: string) {
  if (hash === window.location.hash) return
  const { pathname, search } = window.location
  window.history.replaceState(window.history.state, '', `${pathname}${search}${hash}`)
}
