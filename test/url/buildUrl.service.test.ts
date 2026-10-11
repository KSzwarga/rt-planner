import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import { encodeBuild } from '../../src/codec/codec'
import { type BuildPlan, emptyBuildPlan } from '../../src/model/buildPlan'
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
