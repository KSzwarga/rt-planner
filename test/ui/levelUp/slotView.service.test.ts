import { describe, expect, it } from 'vitest'
import { CHARACTERISTIC } from '../../../src/gamedata/characteristics'
import { FIRST_ARCHETYPE, FIRST_ARCHETYPES } from '../../../src/gamedata/firstArchetypes'
import { TALENTS } from '../../../src/gamedata/talents'
import { type BuildPlan, type Choice, emptyBuildPlan } from '../../../src/model/buildPlan'
import { choiceSlots, emptyChoices } from '../../../src/model/schema'
import type { ChoiceSlotKind } from '../../../src/model/slotKinds'
import { choiceSlotView } from '../../../src/ui/levelUp/slotView'
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
