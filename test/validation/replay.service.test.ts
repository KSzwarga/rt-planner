import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import { ABILITIES } from '../../src/gamedata/abilities'
import { CHARACTERISTIC } from '../../src/gamedata/characteristics'
import { FIRST_ARCHETYPE, FIRST_ARCHETYPES } from '../../src/gamedata/firstArchetypes'
import { HOMEWORLDS } from '../../src/gamedata/homeworlds'
import { ORIGIN } from '../../src/gamedata/originIds'
import { SECOND_ARCHETYPE, SECOND_ARCHETYPES } from '../../src/gamedata/secondArchetypes'
import { SKILL } from '../../src/gamedata/skills'
import { TALENT_LISTS } from '../../src/gamedata/talentLists'
import { TALENTS } from '../../src/gamedata/talents'
import { type BuildPlan, type Choice, emptyBuildPlan } from '../../src/model/buildPlan'
import { choiceSlots, type Schema } from '../../src/model/schema'
import type { ChoiceSlotKind } from '../../src/model/slotKinds'
import { validateBuild } from '../../src/validation/validator'

// The replay with the real game data: the Soldier schema, talent lists and requirements.

const SOLDIER = FIRST_ARCHETYPES.find((entry) => entry.id === FIRST_ARCHETYPE.soldier)!
const BOUNTY_HUNTER = SECOND_ARCHETYPES.find((entry) => entry.id === SECOND_ARCHETYPE.bountyHunter)!
const DEATH_WORLD = HOMEWORLDS.find((entry) => entry.name === 'Death World')!

type Pick = readonly [level: number, kind: ChoiceSlotKind, id: Choice]

/** A choices array for a schema, with each pick in the first free slot of its level and kind. */
function choices(schema: Schema, picks: readonly Pick[]): (Choice | null)[] {
  const slots = choiceSlots(schema)
  const result: (Choice | null)[] = slots.map(() => null)
  for (const [level, kind, id] of picks) {
    const index = slots.findIndex((slot, i) => slot.level === level && slot.kind === kind && result[i] === null)
    if (index === -1) throw new Error(`No free ${kind} slot at level ${level}`)
    result[index] = id
  }
  return result
}

/** The choice in the first slot of a level and kind. */
function choiceAt(schema: Schema, archetypeChoices: readonly (Choice | null)[], level: number, kind: ChoiceSlotKind) {
  const index = choiceSlots(schema).findIndex((slot) => slot.level === level && slot.kind === kind)
  return archetypeChoices[index]
}

function soldier(fields: Partial<BuildPlan>, picks: readonly Pick[]): BuildPlan {
  return {
    ...emptyBuildPlan(),
    firstArchetypeId: SOLDIER.id,
    firstArchetypeChoicesIds: choices(SOLDIER.schema, picks),
    ...fields,
  }
}

function talent(name: string): Choice {
  const entry = TALENTS.find((candidate) => candidate.name === name)
  if (entry === undefined) throw new Error(`No talent named ${name}`)
  return entry.id
}

function ability(name: string): Choice {
  const entry = ABILITIES.find((candidate) => candidate.name === name)
  if (entry === undefined) throw new Error(`No ability named ${name}`)
  return entry.id
}

/** A Soldier talent that isn't also a common talent. */
const SOLDIER_ONLY_TALENT = (() => {
  const listed = (key: string) => TALENT_LISTS.find((list) => list.key === key)!.talentIds
  return listed('soldier').find((id) => !listed('common').includes(id))!
})()

describe('validateBuild replays the archetype choices', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  const first = (plan: BuildPlan, level: number, kind: ChoiceSlotKind) =>
    choiceAt(SOLDIER.schema, plan.firstArchetypeChoicesIds, level, kind)

  describe('characteristic and skill increases', () => {
    it("nulls a skill the new origin doesn't unlock after an origin switch", () => {
      // Coercion isn't a Soldier skill. The Commissar origin unlocks it, the Noble origin doesn't.
      const commissar = soldier({ originId: ORIGIN.commissar }, [[2, 'skillIncrease', SKILL.COERCION]])
      expect(first(validateBuild(commissar), 2, 'skillIncrease')).toBe(SKILL.COERCION)

      const noble = validateBuild({ ...commissar, originId: ORIGIN.noble })
      expect(first(noble, 2, 'skillIncrease')).toBeNull()
      expect(warn).toHaveBeenCalledWith(
        'Validator: nulled firstArchetypeChoicesIds[0] (level 2 skillIncrease) 4: not available to this archetype, origin or homeworld.',
      )
    })

    it('keeps a skill the first archetype can improve, whatever the origin', () => {
      const plan = soldier({ originId: ORIGIN.noble }, [[2, 'skillIncrease', SKILL.MEDICAE]])
      expect(validateBuild(plan)).toEqual(plan)
    })

    it('nulls the third increase of one characteristic in the first archetype', () => {
      const plan = soldier({}, [
        [5, 'characteristicIncrease', CHARACTERISTIC.STR],
        [6, 'characteristicIncrease', CHARACTERISTIC.STR],
        [7, 'characteristicIncrease', CHARACTERISTIC.STR],
      ])
      const validated = validateBuild(plan)
      expect(first(validated, 6, 'characteristicIncrease')).toBe(CHARACTERISTIC.STR)
      expect(first(validated, 7, 'characteristicIncrease')).toBeNull()
    })

    it('raises the cap to 4 in the second archetype, counting the first archetype too', () => {
      // Both Soldier and Bounty Hunter can improve Agility.
      const plan: BuildPlan = {
        ...soldier({}, [
          [5, 'characteristicIncrease', CHARACTERISTIC.AGI],
          [6, 'characteristicIncrease', CHARACTERISTIC.AGI],
        ]),
        secondArchetypeId: BOUNTY_HUNTER.id,
        secondArchetypeChoicesIds: choices(BOUNTY_HUNTER.schema, [
          [20, 'characteristicIncrease', CHARACTERISTIC.AGI],
          [21, 'characteristicIncrease', CHARACTERISTIC.AGI],
          [24, 'characteristicIncrease', CHARACTERISTIC.AGI],
        ]),
      }
      const second = validateBuild(plan).secondArchetypeChoicesIds
      expect(choiceAt(BOUNTY_HUNTER.schema, second, 21, 'characteristicIncrease')).toBe(CHARACTERISTIC.AGI)
      expect(choiceAt(BOUNTY_HUNTER.schema, second, 24, 'characteristicIncrease')).toBeNull()
    })

    it("checks the second archetype's slots against the second archetype", () => {
      // Lore (Xenos) is a Bounty Hunter skill, not a Soldier one.
      const plan: BuildPlan = {
        ...soldier({}, [[2, 'skillIncrease', SKILL.LORE_XENOS]]),
        secondArchetypeId: BOUNTY_HUNTER.id,
        secondArchetypeChoicesIds: choices(BOUNTY_HUNTER.schema, [[23, 'skillIncrease', SKILL.LORE_XENOS]]),
      }
      const validated = validateBuild(plan)
      expect(first(validated, 2, 'skillIncrease')).toBeNull()
      expect(choiceAt(BOUNTY_HUNTER.schema, validated.secondArchetypeChoicesIds, 23, 'skillIncrease')).toBe(SKILL.LORE_XENOS)
    })
  })

  describe('talents', () => {
    it("keeps an archetype talent in the archetype's slot, and nulls it in a common slot", () => {
      const plan = soldier({}, [
        [4, 'firstArchetypeTalent', SOLDIER_ONLY_TALENT],
        [7, 'commonTalent', SOLDIER_ONLY_TALENT],
      ])
      const validated = validateBuild(plan)
      expect(first(validated, 4, 'firstArchetypeTalent')).toBe(SOLDIER_ONLY_TALENT)
      expect(first(validated, 7, 'commonTalent')).toBeNull()
    })

    it('keeps an advanced skill talent taken after its base skill talent', () => {
      const plan = soldier({}, [
        [7, 'commonTalent', talent('Base Skill: Athletics')],
        [12, 'commonTalent', talent('Advanced Skill: Athletics')],
      ])
      expect(validateBuild(plan)).toEqual(plan)
    })

    it('cascades: removing the base skill talent nulls the advanced one', () => {
      const plan = soldier({}, [[12, 'commonTalent', talent('Advanced Skill: Athletics')]])
      expect(first(validateBuild(plan), 12, 'commonTalent')).toBeNull()
      expect(warn.mock.lastCall?.[0]).toMatch(
        new RegExp(`\\(level 12 commonTalent\\) ${talent('Advanced Skill: Athletics')}: unmet requirements: Base Skill: Athletics\\.$`),
      )
    })

    it("doesn't count a base skill talent taken later", () => {
      const plan = soldier({}, [
        [7, 'commonTalent', talent('Advanced Skill: Athletics')],
        [12, 'commonTalent', talent('Base Skill: Athletics')],
      ])
      const validated = validateBuild(plan)
      expect(first(validated, 7, 'commonTalent')).toBeNull()
      expect(first(validated, 12, 'commonTalent')).toBe(talent('Base Skill: Athletics'))
    })

    it('counts a characteristic increase earlier in the same level toward a requirement', () => {
      // STR 30 + 2 starting increases + the level 5 increase = 45, enough for Heavy Armour Proficiency.
      const picks: Pick[] = [
        [5, 'characteristicIncrease', CHARACTERISTIC.STR],
        [5, 'firstArchetypeTalent', talent('Heavy Armour Proficiency')],
      ]
      const strengthTwice = { startingCharacteristicIncreasesIds: [3, 3, null, null, null, null] }
      expect(first(validateBuild(soldier(strengthTwice, picks)), 5, 'firstArchetypeTalent')).toBe(
        talent('Heavy Armour Proficiency'),
      )

      const withoutIncrease = soldier(strengthTwice, [picks[1]])
      expect(first(validateBuild(withoutIncrease), 5, 'firstArchetypeTalent')).toBeNull()
      expect(warn.mock.lastCall?.[0]).toContain('unmet requirements: STR 45')
    })

    it('counts homeworld modifiers toward a requirement', () => {
      // Death World gives STR +5: with 2 starting increases, STR is 45 from the start.
      const plan = soldier(
        { homeworldId: DEATH_WORLD.id, startingCharacteristicIncreasesIds: [3, 3, null, null, null, null] },
        [[4, 'firstArchetypeTalent', talent('Heavy Armour Proficiency')]],
      )
      expect(validateBuild(plan)).toEqual(plan)
    })

    it('nulls a talent taken a second time', () => {
      const plan = soldier({}, [
        [7, 'commonTalent', talent('Base Skill: Athletics')],
        [12, 'commonTalent', talent('Base Skill: Athletics')],
      ])
      expect(first(validateBuild(plan), 12, 'commonTalent')).toBeNull()
    })

    it('nulls an unknown talent ID', () => {
      const plan = soldier({}, [[7, 'commonTalent', 1000]])
      expect(first(validateBuild(plan), 7, 'commonTalent')).toBeNull()
    })
  })

  describe('abilities and upgrades', () => {
    it("keeps the archetype's abilities, and nulls another archetype's", () => {
      // Killing Edge is an Assassin ability.
      const plan = soldier({}, [
        [6, 'firstArchetypeAbility', ability('Dash')],
        [11, 'firstArchetypeAbility', ability('Killing Edge')],
      ])
      const validated = validateBuild(plan)
      expect(first(validated, 6, 'firstArchetypeAbility')).toBe(ability('Dash'))
      expect(first(validated, 11, 'firstArchetypeAbility')).toBeNull()
      expect(warn.mock.lastCall?.[0]).toContain("not in the slot's ability lists")
    })

    it("offers the origin's abilities, and nulls them after an origin switch", () => {
      const commissar = soldier({ originId: ORIGIN.commissar }, [[6, 'firstArchetypeAbility', ability('At All Costs!')]])
      expect(validateBuild(commissar)).toEqual(commissar)

      const noble = validateBuild({ ...commissar, originId: ORIGIN.noble })
      expect(first(noble, 6, 'firstArchetypeAbility')).toBeNull()
    })

    it('nulls an ability taken a second time', () => {
      const plan = soldier({}, [
        [6, 'firstArchetypeAbility', ability('Rapid Fire')],
        [11, 'firstArchetypeAbility', ability('Rapid Fire')],
      ])
      const validated = validateBuild(plan)
      expect(first(validated, 6, 'firstArchetypeAbility')).toBe(ability('Rapid Fire'))
      expect(first(validated, 11, 'firstArchetypeAbility')).toBeNull()
    })

    it('nulls an unknown ability ID', () => {
      expect(first(validateBuild(soldier({}, [[6, 'firstArchetypeAbility', 255]])), 6, 'firstArchetypeAbility')).toBeNull()
    })

    it('nulls an upgrade taken a second time, and one outside 1–4', () => {
      const repeated = soldier({}, [
        [9, 'firearmMasteryUpgrade', 2],
        [15, 'firearmMasteryUpgrade', 2],
      ])
      expect(first(validateBuild(repeated), 15, 'firearmMasteryUpgrade')).toBeNull()

      const outOfRange = soldier({}, [[9, 'firearmMasteryUpgrade', 5]])
      expect(first(validateBuild(outOfRange), 9, 'firearmMasteryUpgrade')).toBeNull()
    })
  })

  it('changes nothing when run on its own output', () => {
    const plan = soldier({ originId: ORIGIN.noble }, [
      [2, 'skillIncrease', SKILL.COERCION],
      [5, 'characteristicIncrease', CHARACTERISTIC.STR],
      [5, 'firstArchetypeTalent', talent('Heavy Armour Proficiency')],
      [7, 'commonTalent', talent('Advanced Skill: Athletics')],
      [12, 'commonTalent', talent('Base Skill: Athletics')],
    ])
    const once = validateBuild(plan)
    warn.mockClear()
    expect(validateBuild(once)).toEqual(once)
    expect(warn).not.toHaveBeenCalled()
  })
})
