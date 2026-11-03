import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import { encodeBuild } from '../../src/codec/codec'
import { FAMILIAR } from '../../src/gamedata/familiars'
import { FIRST_ARCHETYPE, FIRST_ARCHETYPES } from '../../src/gamedata/firstArchetypes'
import { SECOND_ARCHETYPE, SECOND_ARCHETYPES } from '../../src/gamedata/secondArchetypes'
import { type BuildPlan, type Choice, emptyBuildPlan } from '../../src/model/buildPlan'
import { emptyChoices } from '../../src/model/schema'
import { ARCHETYPE_SCHEMAS, buildFromHash, hashFromBuild } from '../../src/url/buildUrl'

function build(fields: Partial<BuildPlan>): BuildPlan {
  return { ...emptyBuildPlan(), ...fields }
}

describe('build ⇄ URL hash', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('round-trips a build with static choices and starting increases', () => {
    const plan = build({
      homeworldId: 3,
      originId: 7,
      triumphId: 2,
      darkestHourId: 3,
      startingCharacteristicIncreasesIds: [1, 1, 5, 9, null, null],
    })
    const hash = hashFromBuild(plan)
    expect(hash).toMatch(/^#[A-Za-z0-9_-]+$/)
    expect(buildFromHash(hash)).toEqual(plan)
  })

  it("round-trips an Overseer's familiar and Overcharge upgrade", () => {
    const officer = FIRST_ARCHETYPES.find((entry) => entry.id === FIRST_ARCHETYPE.officer)!
    const overseer = SECOND_ARCHETYPES.find((entry) => entry.id === SECOND_ARCHETYPE.overseer)!
    const secondChoices: (Choice | null)[] = emptyChoices(overseer.schema)
    secondChoices[0] = FAMILIAR.servoSkullSwarm
    secondChoices[secondChoices.length - 1] = 3 // Level 35: Overcharge upgrade 3.
    const plan = build({
      firstArchetypeId: officer.id,
      firstArchetypeChoicesIds: emptyChoices(officer.schema),
      secondArchetypeId: overseer.id,
      secondArchetypeChoicesIds: secondChoices,
    })
    expect(buildFromHash(hashFromBuild(plan))).toEqual(plan)
    expect(warn).not.toHaveBeenCalled()
  })

  it('gives an empty build no hash, and reads no hash as an empty build', () => {
    expect(hashFromBuild(emptyBuildPlan())).toBe('')
    expect(buildFromHash('')).toEqual(emptyBuildPlan())
    expect(buildFromHash('#')).toEqual(emptyBuildPlan())
  })

  it('opens an unreadable link as an empty build, with a warning', () => {
    expect(buildFromHash('#not*base64url')).toEqual(emptyBuildPlan())
    expect(warn).toHaveBeenCalledOnce()
  })

  it('validates what it reads: illegal selections come back null, and the rest is kept', () => {
    // 15 fits the 4-bit homeworld field, but there is no homeworld 15.
    const hash = `#${encodeBuild(build({ homeworldId: 15, originId: 2, startingCharacteristicIncreasesIds: [3, 3, 3, null, null, null] }), ARCHETYPE_SCHEMAS)}`
    expect(buildFromHash(hash)).toEqual(
      build({ originId: 2, startingCharacteristicIncreasesIds: [3, 3, null, null, null, null] }),
    )
  })
})
