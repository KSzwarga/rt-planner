import { FIRST_ARCHETYPE } from './firstArchetypes'
import { ORIGIN } from './originIds'
import { SECOND_ARCHETYPE } from './secondArchetypes'
import type { CharacteristicEntry } from './types'

/**
 * Characteristic IDs by abbreviation. The order is final: these IDs are stored in links, by the
 * starting characteristic increases and the `characteristicIncrease` slots.
 */
export const CHARACTERISTIC = {
  WS: 1,
  BS: 2,
  STR: 3,
  TGH: 4,
  AGI: 5,
  INT: 6,
  PER: 7,
  WP: 8,
  FEL: 9,
} as const

/**
 * The characteristics, with the archetypes whose `characteristicIncrease` slots can improve them,
 * from the Rogue Trader fandom wiki. The Exemplar can improve every characteristic.
 */
export const CHARACTERISTICS: readonly CharacteristicEntry[] = [
  {
    id: CHARACTERISTIC.WS,
    abbreviation: 'WS',
    name: 'Weapon Skill',
    availableForOrigins: [ORIGIN.arbitratorSubductor],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.warrior,
      FIRST_ARCHETYPE.operative,
      FIRST_ARCHETYPE.officer,
      FIRST_ARCHETYPE.bladedancer,
    ],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.assassin,
      SECOND_ARCHETYPE.vanguard,
      SECOND_ARCHETYPE.masterTactician,
      SECOND_ARCHETYPE.archMilitant,
      SECOND_ARCHETYPE.executioner,
    ],
  },
  {
    id: CHARACTERISTIC.BS,
    abbreviation: 'BS',
    name: 'Ballistic Skill',
    availableForOrigins: [ORIGIN.arbitratorVigilant],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.soldier,
      FIRST_ARCHETYPE.operative,
      FIRST_ARCHETYPE.officer,
    ],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.assassin,
      SECOND_ARCHETYPE.bountyHunter,
      SECOND_ARCHETYPE.masterTactician,
      SECOND_ARCHETYPE.archMilitant,
    ],
  },
  {
    id: CHARACTERISTIC.STR,
    abbreviation: 'STR',
    name: 'Strength',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.soldier,
      FIRST_ARCHETYPE.warrior,
      FIRST_ARCHETYPE.bladedancer,
    ],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.vanguard,
      SECOND_ARCHETYPE.archMilitant,
      SECOND_ARCHETYPE.executioner,
    ],
  },
  {
    id: CHARACTERISTIC.TGH,
    abbreviation: 'TGH',
    name: 'Toughness',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.warrior,
      FIRST_ARCHETYPE.officer,
      FIRST_ARCHETYPE.bladedancer,
    ],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.vanguard,
      SECOND_ARCHETYPE.archMilitant,
      SECOND_ARCHETYPE.executioner,
    ],
  },
  {
    id: CHARACTERISTIC.AGI,
    abbreviation: 'AGI',
    name: 'Agility',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [
      FIRST_ARCHETYPE.soldier,
      FIRST_ARCHETYPE.warrior,
      FIRST_ARCHETYPE.bladedancer,
    ],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.assassin,
      SECOND_ARCHETYPE.bountyHunter,
      SECOND_ARCHETYPE.masterTactician,
      SECOND_ARCHETYPE.archMilitant,
    ],
  },
  {
    id: CHARACTERISTIC.INT,
    abbreviation: 'INT',
    name: 'Intelligence',
    availableForOrigins: [],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.operative],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.assassin,
      SECOND_ARCHETYPE.grandStrategist,
      SECOND_ARCHETYPE.executioner,
    ],
  },
  {
    id: CHARACTERISTIC.PER,
    abbreviation: 'PER',
    name: 'Perception',
    availableForOrigins: [ORIGIN.crimeLord, ORIGIN.navyOfficer],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.soldier, FIRST_ARCHETYPE.operative],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.assassin,
      SECOND_ARCHETYPE.bountyHunter,
      SECOND_ARCHETYPE.grandStrategist,
    ],
  },
  {
    id: CHARACTERISTIC.WP,
    abbreviation: 'WP',
    name: 'Willpower',
    availableForOrigins: [
      ORIGIN.ministorumPriest,
      ORIGIN.sanctionedPsykerBiomancer,
      ORIGIN.sanctionedPsykerDiviner,
      ORIGIN.sanctionedPsykerPyromancer,
      ORIGIN.sanctionedPsykerSanctic,
      ORIGIN.sanctionedPsykerTelepath,
      ORIGIN.arbitratorVigilant,
      ORIGIN.arbitratorCastigator,
      ORIGIN.arbitratorSubductor,
    ],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.officer],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.vanguard,
      SECOND_ARCHETYPE.masterTactician,
      SECOND_ARCHETYPE.grandStrategist,
    ],
  },
  {
    id: CHARACTERISTIC.FEL,
    abbreviation: 'FEL',
    name: 'Fellowship',
    availableForOrigins: [
      ORIGIN.astraMilitarumCommander,
      ORIGIN.commissar,
      ORIGIN.noble,
      ORIGIN.arbitratorCastigator,
    ],
    availableForHomeworlds: [],
    availableForFirstArchetypes: [FIRST_ARCHETYPE.officer],
    availableForSecondArchetypes: [
      SECOND_ARCHETYPE.vanguard,
      SECOND_ARCHETYPE.masterTactician,
      SECOND_ARCHETYPE.grandStrategist,
    ],
  },
]
