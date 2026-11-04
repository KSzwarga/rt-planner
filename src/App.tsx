import { useEffect } from 'react'
import type { ArchetypeTier } from './availability/characterState'
import { ArchetypePickScreen } from './ui/ArchetypePickScreen'
import { LevelUpScreen } from './ui/levelUp/LevelUpScreen'
import { tierSchema } from './ui/levelUp/slotView'
import { LoadingWheel } from './ui/LoadingWheel'
import { useBuildInUrl } from './ui/useBuildInUrl'
import { useScreenTransition } from './ui/useScreenTransition'

/** Which screen is shown (UI Design: Screens). Not part of the build, so not in the URL. */
type Screen = { readonly name: 'archetypePick' } | { readonly name: 'levelUp'; readonly tier: ArchetypeTier }

function App() {
  const [build, update] = useBuildInUrl()
  const { screen, isLoading, openScreen } = useScreenTransition<Screen>({ name: 'archetypePick' })

  // A pasted link can drop the archetype being levelled up: then the archetype pick screen shows.
  const levelUpTier = screen.name === 'levelUp' && tierSchema(build, screen.tier) !== null ? screen.tier : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [levelUpTier])

  if (isLoading) return <LoadingWheel />
  if (levelUpTier !== null) {
    return (
      <LevelUpScreen
        key={levelUpTier}
        build={build}
        tier={levelUpTier}
        onChange={update}
        onReturn={() => openScreen({ name: 'archetypePick' })}
      />
    )
  }
  return (
    <ArchetypePickScreen
      build={build}
      onChange={update}
      onOpenLevelUp={(tier) => openScreen({ name: 'levelUp', tier })}
    />
  )
}

export default App
