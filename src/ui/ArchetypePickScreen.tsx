import { CHARACTERISTICS } from '../gamedata/characteristics'
import { DARKEST_HOURS } from '../gamedata/darkestHours'
import { HOMEWORLDS } from '../gamedata/homeworlds'
import { ORIGINS } from '../gamedata/origins'
import { TRIUMPHS } from '../gamedata/triumphs'
import { ArchetypeRows } from './ArchetypeRows'
import { NestedSelect } from './NestedSelect'
import { StartingIncreases } from './StartingIncreases'
import { useBuildInUrl } from './useBuildInUrl'
import './ArchetypePickScreen.css'

/** The archetype pick screen (UI Design): static choices, starting increases and archetypes. */
export function ArchetypePickScreen() {
  const [build, update] = useBuildInUrl()

  return (
    <main className="archetype-pick">
      <h1 className="archetype-pick__title">Loadout // Archetype select</h1>

      <section className="archetype-pick__static-choices" aria-label="Background">
        <NestedSelect
          label="Homeworld"
          entries={HOMEWORLDS}
          value={build.homeworldId}
          onChange={(homeworldId) => update({ homeworldId })}
        />
        <NestedSelect
          label="Origin"
          entries={ORIGINS}
          value={build.originId}
          onChange={(originId) => update({ originId })}
        />
        <NestedSelect
          label="Triumph"
          entries={TRIUMPHS}
          value={build.triumphId}
          onChange={(triumphId) => update({ triumphId })}
        />
        <NestedSelect
          label="Darkest hour"
          entries={DARKEST_HOURS}
          value={build.darkestHourId}
          onChange={(darkestHourId) => update({ darkestHourId })}
        />
      </section>

      <section className="archetype-pick__starting-increases">
        <StartingIncreases
          characteristics={CHARACTERISTICS}
          ids={build.startingCharacteristicIncreasesIds}
          onChange={(startingCharacteristicIncreasesIds) => update({ startingCharacteristicIncreasesIds })}
        />
      </section>

      <section className="archetype-pick__archetypes" aria-label="Archetypes">
        <ArchetypeRows build={build} onChange={update} />
      </section>
    </main>
  )
}
