import { useEffect, useState } from 'react'
import type { ArchetypeTier } from './availability/characterState'
import { ArchetypePickScreen } from './ui/ArchetypePickScreen'
import { LevelUpScreen } from './ui/levelUp/LevelUpScreen'
import { tierSchema } from './ui/levelUp/slotView'
import { useBuildInUrl } from './ui/useBuildInUrl'

/** Which screen is shown (UI Design: Screens). Not part of the build, so not in the URL. */
type Screen = { readonly name: 'archetypePick' } | { readonly name: 'levelUp'; readonly tier: ArchetypeTier }

function App() {
  const [build, update] = useBuildInUrl()
  const [screen, setScreen] = useState<Screen>({ name: 'archetypePick' })

  // A pasted link can drop the archetype being levelled up: then the archetype pick screen shows.
  const levelUpTier = screen.name === 'levelUp' && tierSchema(build, screen.tier) !== null ? screen.tier : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [levelUpTier])

  if (levelUpTier !== null) {
    return (
      <LevelUpScreen
        key={levelUpTier}
        build={build}
        tier={levelUpTier}
        onChange={update}
        onReturn={() => setScreen({ name: 'archetypePick' })}
      />
    )
  }
  return (
    <ArchetypePickScreen
      build={build}
      onChange={update}
      onOpenLevelUp={(tier) => setScreen({ name: 'levelUp', tier })}
    />
  )
}

export default App
