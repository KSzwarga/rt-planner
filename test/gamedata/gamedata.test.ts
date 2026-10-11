import { describe, expect, it } from 'vitest'
import { FIELD_BITS } from '../../src/codec/layout'
import { ABILITIES } from '../../src/gamedata/abilities'
import { ABILITY_LISTS } from '../../src/gamedata/abilityLists'
import { CHARACTERISTIC, CHARACTERISTICS } from '../../src/gamedata/characteristics'
import { DARKEST_HOURS } from '../../src/gamedata/darkestHours'
import { FIRST_ARCHETYPE, FIRST_ARCHETYPES } from '../../src/gamedata/firstArchetypes'
import { EXEMPLAR } from '../../src/gamedata/exemplar'
import { HOMEWORLDS } from '../../src/gamedata/homeworlds'
import { KEYSTONE_FEATURES } from '../../src/gamedata/keystoneFeatures'
import { ORIGIN } from '../../src/gamedata/originIds'
import { ORIGINS } from '../../src/gamedata/origins'
import { SECOND_ARCHETYPE, SECOND_ARCHETYPES } from '../../src/gamedata/secondArchetypes'
import { SKILL, SKILLS } from '../../src/gamedata/skills'
import { TALENT_LISTS } from '../../src/gamedata/talentLists'
import { TALENT_REQUIREMENTS, talentRequirements } from '../../src/gamedata/talentRequirements'
import { TALENTS } from '../../src/gamedata/talents'
import { TRIUMPHS } from '../../src/gamedata/triumphs'
import type {
  ArchetypeEntry,
  BackgroundEntry,
  IncreaseAvailability,
  Requirement,
  TableEntry,
} from '../../src/gamedata/types'
import { choiceSlotBits, isKeystoneFeature } from '../../src/model/slotKinds'

const TABLES: { name: string; entries: readonly TableEntry[]; bits: number }[] = [
  { name: 'characteristics', entries: CHARACTERISTICS, bits: FIELD_BITS.startingCharacteristicIncrease },
  { name: 'homeworlds', entries: HOMEWORLDS, bits: FIELD_BITS.homeworldId },
  { name: 'origins', entries: ORIGINS, bits: FIELD_BITS.originId },
  { name: 'triumphs', entries: TRIUMPHS, bits: FIELD_BITS.triumphId },
  { name: 'darkest hours', entries: DARKEST_HOURS, bits: FIELD_BITS.darkestHourId },
  { name: 'first archetypes', entries: FIRST_ARCHETYPES, bits: FIELD_BITS.firstArchetypeId },
  { name: 'second archetypes', entries: SECOND_ARCHETYPES, bits: FIELD_BITS.secondArchetypeId },
  { name: 'talents', entries: TALENTS, bits: choiceSlotBits('commonTalent') },
  { name: 'abilities', entries: ABILITIES, bits: choiceSlotBits('firstArchetypeAbility') },
  { name: 'skills', entries: SKILLS, bits: choiceSlotBits('skillIncrease') },
]

describe.each(TABLES)('$name table', ({ entries, bits }) => {
  it('has at least one entry', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  it('has unique IDs', () => {
    const ids = entries.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it(`has IDs from 1 that fit in ${bits} bits`, () => {
    for (const { id } of entries) {
      expect(Number.isInteger(id)).toBe(true)
      expect(id).toBeGreaterThanOrEqual(1)
      expect(id).toBeLessThan(2 ** bits)
    }
  })

  it('has a name for every entry', () => {
    for (const { name } of entries) {
      expect(name.trim()).not.toBe('')
    }
  })
})

describe.each([
  { name: 'first archetype', entries: FIRST_ARCHETYPES as readonly ArchetypeEntry[], minLevel: 1, maxLevel: 15 },
  { name: 'second archetype', entries: SECOND_ARCHETYPES as readonly ArchetypeEntry[], minLevel: 16, maxLevel: 35 },
])('$name schemas', ({ entries, minLevel, maxLevel }) => {
  it.each(entries.map((entry) => [entry.name, entry] as const))(
    `%s covers every level from ${minLevel} to ${maxLevel}, and no other`,
    (_, { schema }) => {
      const levels = Object.keys(schema).map(Number).sort((a, b) => a - b)
      expect(levels).toEqual(Array.from({ length: maxLevel - minLevel + 1 }, (__, i) => minLevel + i))
    },
  )

  it.each(entries.map((entry) => [entry.name, entry] as const))(
    '%s only uses keystone features that exist',
    (_, { schema }) => {
      for (const slot of Object.values(schema).flat()) {
        if (isKeystoneFeature(slot)) expect(Object.keys(KEYSTONE_FEATURES)).toContain(slot.featureKey)
      }
    },
  )

  it.each(entries.map((entry) => [entry.name, entry] as const))('%s has at least one slot per level', (_, { schema }) => {
    for (const slots of Object.values(schema)) {
      expect(slots.length).toBeGreaterThan(0)
    }
  })
})

describe('first archetypes', () => {
  it('only allow second archetypes that exist', () => {
    const secondIds = new Set(SECOND_ARCHETYPES.map((entry) => entry.id))
    for (const { allowedSecondArchetypeIds } of FIRST_ARCHETYPES) {
      for (const id of allowedSecondArchetypeIds) {
        expect(secondIds).toContain(id)
      }
    }
  })
})

describe('characteristics', () => {
  it('has one entry per CHARACTERISTIC ID, with the matching abbreviation', () => {
    expect(CHARACTERISTICS.map(({ id, abbreviation }) => [abbreviation, id])).toEqual(Object.entries(CHARACTERISTIC))
  })
})

describe.each([
  { name: 'homeworlds', entries: HOMEWORLDS as readonly BackgroundEntry[] },
  { name: 'origins', entries: ORIGINS as readonly BackgroundEntry[] },
])('$name', ({ entries }) => {
  it('only modify characteristics that exist', () => {
    const characteristicIds = new Set(CHARACTERISTICS.map((entry) => entry.id))
    for (const { characteristicModifiers } of entries) {
      for (const { characteristicId } of characteristicModifiers) {
        expect(characteristicIds).toContain(characteristicId)
      }
    }
  })
})

describe('talents', () => {
  it('have unique names and a description', () => {
    expect(new Set(TALENTS.map((talent) => talent.name)).size).toBe(TALENTS.length)
    for (const { description } of TALENTS) {
      expect(description.trim()).not.toBe('')
    }
  })

  it('are each in at least one list', () => {
    const listed = new Set(TALENT_LISTS.flatMap((list) => list.talentIds))
    for (const { id, name } of TALENTS) {
      expect(listed.has(id), name).toBe(true)
    }
  })
})

describe('talent lists', () => {
  const listKeys = new Set(TALENT_LISTS.map((list) => list.key))

  it('have unique keys, and include common', () => {
    expect(listKeys.size).toBe(TALENT_LISTS.length)
    expect(listKeys).toContain('common')
  })

  it.each(TALENT_LISTS.map((list) => [list.key, list] as const))('%s only lists existing talents, once each', (_, list) => {
    const talentIds = new Set(TALENTS.map((talent) => talent.id))
    for (const id of list.talentIds) {
      expect(talentIds).toContain(id)
    }
    expect(new Set(list.talentIds).size).toBe(list.talentIds.length)
  })

  it('exist for every list a homeworld, origin or archetype grants', () => {
    const granted = [
      ...[...HOMEWORLDS, ...ORIGINS].flatMap((entry) => entry.grantsTalentLists),
      ...[...FIRST_ARCHETYPES, ...SECOND_ARCHETYPES].map((entry) => entry.archetypeTalentList),
    ]
    for (const key of granted) {
      expect(listKeys, key).toContain(key)
    }
  })
})

describe('skills', () => {
  it('has one entry per SKILL ID, in order', () => {
    expect(SKILLS.map((skill) => skill.id)).toEqual(Object.values(SKILL))
  })
})

describe('characteristic and skill increases', () => {
  /** The increase-table entries an archetype can improve: characteristics by abbreviation, skills by name. */
  function improvable(
    entries: readonly (IncreaseAvailability & { readonly name: string; readonly abbreviation: string })[],
    tier: 'availableForFirstArchetypes' | 'availableForSecondArchetypes',
    archetypeId: number,
  ): string[] {
    const label = entries === CHARACTERISTICS ? 'abbreviation' : 'name'
    return entries.filter((entry) => entry[tier].includes(archetypeId)).map((entry) => entry[label])
  }

  // Restated per archetype, as the fandom wiki lists them, to check that the tables were transposed right.
  it.each([
    ['Soldier', FIRST_ARCHETYPE.soldier, ['BS', 'STR', 'AGI', 'PER'], ['Athletics', 'Awareness', 'Demolition', 'Medicae']],
    [
      'Warrior',
      FIRST_ARCHETYPE.warrior,
      ['WS', 'STR', 'TGH', 'AGI'],
      ['Athletics', 'Carouse', 'Coercion', 'Demolition', 'Medicae'],
    ],
    [
      'Operative',
      FIRST_ARCHETYPE.operative,
      ['WS', 'BS', 'INT', 'PER'],
      ['Awareness', 'Logic', 'Lore (Imperium)', 'Lore (Xenos)', 'Medicae', 'Tech-Use'],
    ],
    [
      'Officer',
      FIRST_ARCHETYPE.officer,
      ['WS', 'BS', 'TGH', 'WP', 'FEL'],
      ['Carouse', 'Coercion', 'Commerce', 'Lore (Imperium)', 'Persuasion'],
    ],
    [
      'Bladedancer',
      FIRST_ARCHETYPE.bladedancer,
      ['WS', 'STR', 'TGH', 'AGI'],
      ['Athletics', 'Awareness', 'Carouse', 'Demolition', 'Medicae'],
    ],
  ])('first archetype %s improves what the wiki lists', (_, id, characteristics, skills) => {
    expect(improvable(CHARACTERISTICS, 'availableForFirstArchetypes', id)).toEqual(characteristics)
    expect(improvable(SKILLS, 'availableForFirstArchetypes', id)).toEqual(skills)
  })

  it.each([
    [
      'Assassin',
      SECOND_ARCHETYPE.assassin,
      ['WS', 'BS', 'AGI', 'INT', 'PER'],
      ['Awareness', 'Lore (Imperium)', 'Lore (Xenos)'],
    ],
    [
      'Vanguard',
      SECOND_ARCHETYPE.vanguard,
      ['WS', 'STR', 'TGH', 'WP', 'FEL'],
      ['Athletics', 'Carouse', 'Coercion', 'Commerce', 'Lore (Imperium)', 'Persuasion'],
    ],
    [
      'Bounty Hunter',
      SECOND_ARCHETYPE.bountyHunter,
      ['BS', 'AGI', 'PER'],
      ['Athletics', 'Awareness', 'Demolition', 'Lore (Xenos)', 'Medicae'],
    ],
    [
      'Master Tactician',
      SECOND_ARCHETYPE.masterTactician,
      ['WS', 'BS', 'AGI', 'WP', 'FEL'],
      ['Demolition', 'Lore (Imperium)', 'Medicae', 'Persuasion'],
    ],
    [
      'Grand Strategist',
      SECOND_ARCHETYPE.grandStrategist,
      ['INT', 'PER', 'WP', 'FEL'],
      ['Commerce', 'Demolition', 'Logic', 'Lore (Imperium)', 'Lore (Xenos)', 'Persuasion', 'Tech-Use'],
    ],
    [
      'Arch-Militant',
      SECOND_ARCHETYPE.archMilitant,
      ['WS', 'BS', 'STR', 'TGH', 'AGI'],
      ['Athletics', 'Awareness', 'Carouse', 'Demolition', 'Medicae'],
    ],
    [
      'Executioner',
      SECOND_ARCHETYPE.executioner,
      ['WS', 'STR', 'TGH', 'INT'],
      ['Athletics', 'Lore (Imperium)', 'Lore (Xenos)', 'Medicae'],
    ],
  ])('second archetype %s improves what the wiki lists', (_, id, characteristics, skills) => {
    expect(improvable(CHARACTERISTICS, 'availableForSecondArchetypes', id)).toEqual(characteristics)
    expect(improvable(SKILLS, 'availableForSecondArchetypes', id)).toEqual(skills)
  })

  it('only reference archetypes that exist', () => {
    const firstIds = FIRST_ARCHETYPES.map((entry) => entry.id)
    const secondIds = SECOND_ARCHETYPES.map((entry) => entry.id)
    for (const entry of [...CHARACTERISTICS, ...SKILLS]) {
      for (const id of entry.availableForFirstArchetypes) expect(firstIds).toContain(id)
      for (const id of entry.availableForSecondArchetypes) expect(secondIds).toContain(id)
    }
  })
})

describe('talent requirements', () => {
  function talentNamed(name: string) {
    const talent = TALENTS.find((entry) => entry.name === name)
    if (talent === undefined) throw new Error(`No talent named ${name}`)
    return talent
  }

  it('Heavy Armour Proficiency needs 45 Strength', () => {
    expect(talentRequirements(talentNamed('Heavy Armour Proficiency').id)).toEqual([
      { kind: 'characteristic', id: CHARACTERISTIC.STR, min: 45 },
    ])
  })

  it.each(SKILLS.map((skill) => skill.name))('Advanced Skill: %s needs its Base Skill talent', (skill) => {
    expect(talentRequirements(talentNamed(`Advanced Skill: ${skill}`).id)).toEqual([
      { kind: 'talent', id: talentNamed(`Base Skill: ${skill}`).id },
    ])
  })

  it('is empty for a talent without requirements', () => {
    expect(talentRequirements(talentNamed('Base Skill: Athletics').id)).toEqual([])
  })

  it('only references talents and characteristics that exist', () => {
    const talentIds = new Set(TALENTS.map((talent) => talent.id))
    const characteristicIds = new Set(CHARACTERISTICS.map((characteristic) => characteristic.id))
    function check(requirement: Requirement) {
      if (requirement.kind === 'talent') expect(talentIds).toContain(requirement.id)
      if (requirement.kind === 'characteristic') expect(characteristicIds).toContain(requirement.id)
      if (requirement.kind === 'anyOf') requirement.of.forEach(check)
    }
    for (const [talentId, requirements] of TALENT_REQUIREMENTS) {
      expect(talentIds).toContain(talentId)
      requirements.forEach(check)
    }
  })
})

describe('origin advancement', () => {
  function unlockedBy<T extends IncreaseAvailability & { readonly name: string }>(
    entries: readonly T[],
    label: (entry: T) => string,
    originId: number,
  ): string[] {
    return entries.filter((entry) => entry.availableForOrigins.includes(originId)).map(label)
  }

  // Restated per origin, as the wiki's "On advancement this Origin makes available" lists them.
  it.each([
    ['Astra Militarum Commander', ORIGIN.astraMilitarumCommander, ['FEL'], ['Athletics']],
    ['Commissar', ORIGIN.commissar, ['FEL'], ['Coercion']],
    ['Crime Lord', ORIGIN.crimeLord, ['PER'], ['Awareness']],
    ['Ministorum Priest', ORIGIN.ministorumPriest, ['WP'], ['Lore (Imperium)']],
    ['Navy Officer', ORIGIN.navyOfficer, ['PER'], ['Carouse']],
    ['Noble', ORIGIN.noble, ['FEL'], ['Persuasion']],
    ['Sanctioned Psyker: Biomancer', ORIGIN.sanctionedPsykerBiomancer, ['WP'], ['Lore (Warp)']],
    ['Sanctioned Psyker: Diviner', ORIGIN.sanctionedPsykerDiviner, ['WP'], ['Lore (Warp)']],
    ['Sanctioned Psyker: Pyromancer', ORIGIN.sanctionedPsykerPyromancer, ['WP'], ['Lore (Warp)']],
    ['Sanctioned Psyker: Sanctic', ORIGIN.sanctionedPsykerSanctic, ['WP'], ['Lore (Warp)']],
    ['Sanctioned Psyker: Telepath', ORIGIN.sanctionedPsykerTelepath, ['WP'], ['Lore (Warp)']],
    ['Arbitrator: Vigilant', ORIGIN.arbitratorVigilant, ['BS', 'WP'], ['Coercion']],
    ['Arbitrator: Castigator', ORIGIN.arbitratorCastigator, ['WP', 'FEL'], ['Coercion']],
    ['Arbitrator: Subductor', ORIGIN.arbitratorSubductor, ['WS', 'WP'], ['Coercion']],
  ])('%s makes what the wiki lists available', (name, id, characteristics, skills) => {
    expect(ORIGINS.find((origin) => origin.id === id)?.name).toBe(name)
    expect(unlockedBy(CHARACTERISTICS, (entry) => entry.abbreviation, id)).toEqual(characteristics)
    expect(unlockedBy(SKILLS, (entry) => entry.name, id)).toEqual(skills)
  })

  it('makes nothing available for homeworlds yet', () => {
    for (const entry of [...CHARACTERISTICS, ...SKILLS]) {
      expect(entry.availableForHomeworlds).toEqual([])
    }
  })

  it('only references origins that exist', () => {
    const originIds = ORIGINS.map((origin) => origin.id)
    for (const entry of [...CHARACTERISTICS, ...SKILLS]) {
      for (const id of entry.availableForOrigins) expect(originIds).toContain(id)
    }
  })
})

describe('abilities', () => {
  it('have unique names and a description', () => {
    expect(new Set(ABILITIES.map((ability) => ability.name)).size).toBe(ABILITIES.length)
    for (const { description } of ABILITIES) {
      expect(description.trim()).not.toBe('')
    }
  })

  it('are each in at least one list', () => {
    const listed = new Set(ABILITY_LISTS.flatMap((list) => list.abilityIds))
    for (const { id, name } of ABILITIES) {
      expect(listed.has(id), name).toBe(true)
    }
  })

  it('leave out keystone abilities and ultimates, which are keystone features', () => {
    const keystoneNames = Object.values(KEYSTONE_FEATURES).map((feature) => normaliseName(feature.name))
    for (const { name } of ABILITIES) {
      expect(keystoneNames, name).not.toContain(normaliseName(name))
      expect(name).not.toMatch(/Heroic Act|Desperate Measure/)
    }
  })

  it('share a name with a talent only where the two are different things', () => {
    // Different effects from different sources, e.g. Defensive Stance is a Warrior talent and a Vanguard ability.
    const talentNames = new Set(TALENTS.map((talent) => talent.name))
    const shared = ABILITIES.map((ability) => ability.name).filter((name) => talentNames.has(name))
    expect(shared.sort()).toEqual(['Defensive Stance', 'Perfect Timing', 'Strongpoint'])
  })
})

describe('ability lists', () => {
  const listKeys = new Set(ABILITY_LISTS.map((list) => list.key))

  it('have unique keys, and no common list', () => {
    expect(listKeys.size).toBe(ABILITY_LISTS.length)
    expect(listKeys).not.toContain('common')
  })

  it.each(ABILITY_LISTS.map((list) => [list.key, list] as const))('%s only lists existing abilities, once each', (_, list) => {
    const abilityIds = new Set(ABILITIES.map((ability) => ability.id))
    for (const id of list.abilityIds) {
      expect(abilityIds).toContain(id)
    }
    expect(new Set(list.abilityIds).size).toBe(list.abilityIds.length)
  })

  it('exist for every list a homeworld, origin or archetype grants', () => {
    const granted = [
      ...[...HOMEWORLDS, ...ORIGINS].flatMap((entry) => entry.grantsAbilityLists),
      ...[...FIRST_ARCHETYPES, ...SECOND_ARCHETYPES].map((entry) => entry.archetypeAbilityList),
    ]
    for (const key of granted) {
      expect(listKeys, key).toContain(key)
    }
  })
})

/** Compares names ignoring case, spacing and punctuation, so 'Bladedance' matches 'Blade Dance'. */
function normaliseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

describe('abbreviations', () => {
  it.each([
    ['characteristics', CHARACTERISTICS],
    ['skills', SKILLS],
    ['talents', TALENTS],
    ['abilities', ABILITIES],
    ['keystone features', Object.values(KEYSTONE_FEATURES)],
  ] as const)('every entry of %s has one of 1 to 4 characters', (_, entries) => {
    for (const { name, abbreviation } of entries) {
      expect(abbreviation, name).toMatch(/^\S{1,4}$/)
    }
  })
})

describe('archetype icons', () => {
  it('differ for every archetype and the Exemplar', () => {
    const icons = [...FIRST_ARCHETYPES, ...SECOND_ARCHETYPES, EXEMPLAR].map((archetype) => archetype.icon)
    expect(new Set(icons).size).toBe(icons.length)
  })
})

