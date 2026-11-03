import { describe, expect, it } from 'vitest'
import { CHARACTERISTIC } from '../../../src/gamedata/characteristics'
import { FAMILIAR, FAMILIARS } from '../../../src/gamedata/familiars'
import { FIRST_ARCHETYPE, FIRST_ARCHETYPES } from '../../../src/gamedata/firstArchetypes'
import { SECOND_ARCHETYPE, SECOND_ARCHETYPES } from '../../../src/gamedata/secondArchetypes'
import { TALENTS } from '../../../src/gamedata/talents'
import { type BuildPlan, type Choice, emptyBuildPlan } from '../../../src/model/buildPlan'
import { choiceSlots, emptyChoices } from '../../../src/model/schema'
import type { ChoiceSlotKind } from '../../../src/model/slotKinds'
import { buildFamiliar, choiceIconUrl, choiceSlotView } from '../../../src/ui/levelUp/slotView'
import { validateBuild } from '../../../src/validation/validator'

// What a slot offers, worked out from the real data and the choices before it.

const SOLDIER = FIRST_ARCHETYPES.find((entry) => entry.id === FIRST_ARCHETYPE.soldier)!
const slots = choiceSlots(SOLDIER.schema)

function slotIndex(level: number, kind: ChoiceSlotKind): number {
  return slots.findIndex((slot) => slot.level === level && slot.kind === kind)
}

function soldier(picks: [number, ChoiceSlotKind, Choice][], fields: Partial<BuildPlan> = {}): BuildPlan {
  const choices: (Choice | null)[] = emptyChoices(SOLDIER.schema)
  for (const [level, kind, id] of picks) choices[slotIndex(level, kind)] = id
  return validateBuild({ ...emptyBuildPlan(), ...fields, firstArchetypeId: SOLDIER.id, firstArchetypeChoicesIds: choices })
}

const HEAVY_ARMOUR = TALENTS.find((talent) => talent.name === 'Heavy Armour Proficiency')!.id
const STRENGTH_TWICE = { startingCharacteristicIncreasesIds: [3, 3, null, null, null, null] }

function heavyArmourAtLevel5(plan: BuildPlan) {
  return choiceSlotView(plan, 'first', slotIndex(5, 'firstArchetypeTalent'))
    .groups.flatMap((group) => group.options)
    .find((option) => option.id === HEAVY_ARMOUR)!
}

describe('choiceSlotView', () => {
  it("lists a first archetype talent slot's groups: the archetype's list, then common", () => {
    const view = choiceSlotView(soldier([]), 'first', slotIndex(4, 'firstArchetypeTalent'))
    expect(view.title).toBe('Talents')
    expect(view.groups.map((group) => group.name)).toEqual(['Soldier', 'Common'])
  })

  it('shows a talent whose requirement is unmet in red, with the requirement', () => {
    const option = heavyArmourAtLevel5(soldier([], STRENGTH_TWICE))
    expect(option).toMatchObject({ selectable: false, problems: ['Requires STR 45'] })
  })

  it("doesn't count a later choice toward an earlier slot's requirements", () => {
    const plan = soldier([[10, 'characteristicIncrease', CHARACTERISTIC.STR]], STRENGTH_TWICE)
    expect(heavyArmourAtLevel5(plan).selectable).toBe(false)
  })

  it('counts an earlier choice in the same level', () => {
    const plan = soldier([[5, 'characteristicIncrease', CHARACTERISTIC.STR]], STRENGTH_TWICE)
    expect(heavyArmourAtLevel5(plan)).toMatchObject({ selectable: true, problems: [] })
  })

  it('shows a characteristic at its cap in red, and leaves out what nothing unlocks', () => {
    const plan = soldier([
      [5, 'characteristicIncrease', CHARACTERISTIC.AGI],
      [6, 'characteristicIncrease', CHARACTERISTIC.AGI],
    ])
    const options = choiceSlotView(plan, 'first', slotIndex(7, 'characteristicIncrease')).groups[0].options
    expect(options.map((option) => [option.abbreviation, option.selectable])).toEqual([
      ['BS', true],
      ['STR', true],
      ['AGI', false],
      ['PER', true],
    ])
  })

  it('marks the current choice', () => {
    const plan = soldier([[2, 'skillIncrease', 11]])
    const view = choiceSlotView(plan, 'first', slotIndex(2, 'skillIncrease'))
    expect(view.current?.name).toBe('Medicae')
  })
})

describe("the Overseer's familiar", () => {
  const OVERSEER = SECOND_ARCHETYPES.find((entry) => entry.id === SECOND_ARCHETYPE.overseer)!
  const overseerSlots = choiceSlots(OVERSEER.schema)
  const FAMILIAR_SLOT = overseerSlots.findIndex((slot) => slot.kind === 'familiar')
  const UPGRADE_SLOT = overseerSlots.findIndex((slot) => slot.kind === 'overchargeUpgrade')

  function overseer(familiarId: Choice | null): BuildPlan {
    const choices: (Choice | null)[] = emptyChoices(OVERSEER.schema)
    choices[FAMILIAR_SLOT] = familiarId
    return validateBuild({ ...emptyBuildPlan(), secondArchetypeId: OVERSEER.id, secondArchetypeChoicesIds: choices })
  }

  it('offers every familiar in its familiar slot', () => {
    const view = choiceSlotView(overseer(null), 'second', FAMILIAR_SLOT)
    expect(view.title).toBe('Familiar')
    expect(view.groups.map((group) => group.name)).toEqual(['Familiars'])
    expect(view.groups[0].options.map((option) => [option.name, option.selectable])).toEqual(
      FAMILIARS.map((familiar) => [familiar.name, true]),
    )
  })

  it('shows Overcharge upgrades in red until a familiar is picked', () => {
    const options = choiceSlotView(overseer(null), 'second', UPGRADE_SLOT).groups[0].options
    for (const option of options) {
      expect(option).toMatchObject({ selectable: false, problems: ['Requires a familiar'] })
    }
  })

  it("names the upgrades after the picked familiar's Overcharge", () => {
    const options = choiceSlotView(overseer(FAMILIAR.psyberRaven), 'second', UPGRADE_SLOT).groups[0].options
    expect(options[0]).toMatchObject({
      selectable: true,
      problems: [],
      typeLabel: 'Ultimate upgrade · Overcharge (Psyber-Raven)',
    })
  })

  it('finds the familiar the build picked', () => {
    expect(buildFamiliar(overseer(FAMILIAR.cyberEagle))?.name).toBe('Cyber-Eagle')
    expect(buildFamiliar(overseer(null))).toBeNull()
  })
})

describe('talent icons', () => {
  const FATEBRINGER = TALENTS.find((talent) => talent.name === 'Fatebringer')!.id
  // Files in public/ are served under the app's base path.
  const FATEBRINGER_ICON = `${import.meta.env.BASE_URL}icons/talents/fatebringer.webp`

  it("gives a talent with an icon its URL, under the app's base path", () => {
    // The Diviner origin grants the Divination list, which has Fatebringer.
    const plan = soldier([], { originId: 8 })
    const options = choiceSlotView(plan, 'first', slotIndex(7, 'commonTalent')).groups.flatMap((group) => group.options)
    expect(options.find((option) => option.id === FATEBRINGER)?.iconUrl).toBe(FATEBRINGER_ICON)
    expect(options.find((option) => option.id === HEAVY_ARMOUR)?.iconUrl).toBeNull()
  })

  it("gives a picked talent's node its icon, and nothing else one", () => {
    expect(choiceIconUrl('commonTalent', FATEBRINGER)).toBe(FATEBRINGER_ICON)
    expect(choiceIconUrl('commonTalent', HEAVY_ARMOUR)).toBeNull()
    expect(choiceIconUrl('skillIncrease', 1)).toBeNull()
  })
})
