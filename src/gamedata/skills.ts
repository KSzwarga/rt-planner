import { FIRST_ARCHETYPE } from './firstArchetypes'
import { ORIGIN } from './originIds'
import { SECOND_ARCHETYPE } from './secondArchetypes'
import type { SkillEntry } from './types'

/** Skill IDs by key. The order is final: these IDs are stored in links by the `skillIncrease` slots. */
export const SKILL = {
  ATHLETICS: 1,
  AWARENESS: 2,
  CAROUSE: 3,
  COERCION: 4,
  COMMERCE: 5,
  DEMOLITION: 6,
  LOGIC: 7,
  LORE_IMPERIUM: 8,
  LORE_WARP: 9,
  LORE_XENOS: 10,
  MEDICAE: 11,
  PERSUASION: 12,
  TECH_USE: 13,
} as const

/**
 * The skills, with the archetypes whose `skillIncrease` slots can improve them, from the Rogue
 * Trader fandom wiki. The Exemplar can improve every skill.
 */
export const SKILLS: readonly SkillEntry[] = [
  {
    id: SKILL.ATHLETICS,
    name: 'Athletics',
    availableForOrigins: [ORIGIN.astraMilitarumCommander],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.soldier,
      FIRST_ARCHETYPE.warrior,
      FIRST_ARCHETYPE.bladedancer,
    ],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.vanguard,
      SECOND_ARCHETYPE.bountyHunter,
      SECOND_ARCHETYPE.archMilitant,
      SECOND_ARCHETYPE.executioner,
    ],
  },
  {
    id: SKILL.AWARENESS,
    name: 'Awareness',
    availableForOrigins: [ORIGIN.crimeLord],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.soldier,
      FIRST_ARCHETYPE.operative,
      FIRST_ARCHETYPE.bladedancer,
    ],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.assassin,
      SECOND_ARCHETYPE.bountyHunter,
      SECOND_ARCHETYPE.archMilitant,
    ],
  },
  {
    id: SKILL.CAROUSE,
    name: 'Carouse',
    availableForOrigins: [ORIGIN.navyOfficer],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.warrior,
      FIRST_ARCHETYPE.officer,
      FIRST_ARCHETYPE.bladedancer,
    ],
    availableForSecondArchetypes: [SECOND_ARCHETYPE.vanguard, SECOND_ARCHETYPE.archMilitant],
  },
  {
    id: SKILL.COERCION,
    name: 'Coercion',
    availableForOrigins: [
      ORIGIN.commissar,
      ORIGIN.arbitratorVigilant,
      ORIGIN.arbitratorCastigator,
      ORIGIN.arbitratorSubductor,
    ],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.warrior, FIRST_ARCHETYPE.officer],
    availableForSecondArchetypes: [SECOND_ARCHETYPE.vanguard],
  },
  {
    id: SKILL.COMMERCE,
    name: 'Commerce',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.officer],
    availableForSecondArchetypes: [SECOND_ARCHETYPE.vanguard, SECOND_ARCHETYPE.grandStrategist],
  },
  {
    id: SKILL.DEMOLITION,
    name: 'Demolition',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.soldier,
      FIRST_ARCHETYPE.warrior,
      FIRST_ARCHETYPE.bladedancer,
    ],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.bountyHunter,
      SECOND_ARCHETYPE.masterTactician,
      SECOND_ARCHETYPE.grandStrategist,
      SECOND_ARCHETYPE.archMilitant,
    ],
  },
  {
    id: SKILL.LOGIC,
    name: 'Logic',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.operative],
    availableForSecondArchetypes: [SECOND_ARCHETYPE.grandStrategist],
  },
  {
    id: SKILL.LORE_IMPERIUM,
    name: 'Lore (Imperium)',
    availableForOrigins: [ORIGIN.ministorumPriest],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.operative, FIRST_ARCHETYPE.officer],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.assassin,
      SECOND_ARCHETYPE.vanguard,
      SECOND_ARCHETYPE.masterTactician,
      SECOND_ARCHETYPE.grandStrategist,
      SECOND_ARCHETYPE.executioner,
    ],
  },
  {
    id: SKILL.LORE_WARP,
    name: 'Lore (Warp)',
    availableForOrigins: [
      ORIGIN.sanctionedPsykerBiomancer,
      ORIGIN.sanctionedPsykerDiviner,
      ORIGIN.sanctionedPsykerPyromancer,
      ORIGIN.sanctionedPsykerSanctic,
      ORIGIN.sanctionedPsykerTelepath,
    ],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [],
    availableForSecondArchetypes: [],
  },
  {
    id: SKILL.LORE_XENOS,
    name: 'Lore (Xenos)',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.operative],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.assassin,
      SECOND_ARCHETYPE.bountyHunter,
      SECOND_ARCHETYPE.grandStrategist,
      SECOND_ARCHETYPE.executioner,
    ],
  },
  {
    id: SKILL.MEDICAE,
    name: 'Medicae',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.soldier,
      FIRST_ARCHETYPE.warrior,
      FIRST_ARCHETYPE.operative,
      FIRST_ARCHETYPE.bladedancer,
    ],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.bountyHunter,
      SECOND_ARCHETYPE.masterTactician,
      SECOND_ARCHETYPE.archMilitant,
      SECOND_ARCHETYPE.executioner,
    ],
  },
  {
    id: SKILL.PERSUASION,
    name: 'Persuasion',
    availableForOrigins: [ORIGIN.noble],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.officer],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.vanguard,
      SECOND_ARCHETYPE.masterTactician,
      SECOND_ARCHETYPE.grandStrategist,
    ],
  },
  {
    id: SKILL.TECH_USE,
    name: 'Tech-Use',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.operative],
    availableForSecondArchetypes: [SECOND_ARCHETYPE.grandStrategist],
  },
]
