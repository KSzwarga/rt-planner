import { CHARACTERISTIC } from './characteristics'
import { ORIGIN } from './originIds'
import type { OriginEntry } from './types'

export const ORIGINS: readonly OriginEntry[] = [
  {
    id: ORIGIN.astraMilitarumCommander,
    name: 'Astra Militarum Commander',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.BS, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: 5 },
    ],
    grantsTalentLists: ['astraMilitarumCommander'],
    grantsAbilityLists: ['astraMilitarumCommander'],
  },
  {
    id: ORIGIN.commissar,
    name: 'Commissar',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.BS, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: 5 },
    ],
    grantsTalentLists: ['commissar'],
    grantsAbilityLists: ['commissar'],
  },
  {
    id: ORIGIN.crimeLord,
    name: 'Crime Lord',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.WS, amount: 5 },
      { characteristicId: CHARACTERISTIC.PER, amount: 5 },
    ],
    grantsTalentLists: ['crimeLord'],
    grantsAbilityLists: [],
  },
  {
    id: ORIGIN.ministorumPriest,
    name: 'Ministorum Priest',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.WP, amount: 10 },
    ],
    grantsTalentLists: ['ministorumPriest'],
    grantsAbilityLists: ['ministorumPriest'],
  },
  {
    id: ORIGIN.navyOfficer,
    name: 'Navy Officer',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.PER, amount: 5 },
    ],
    grantsTalentLists: ['navyOfficer'],
    grantsAbilityLists: ['navyOfficer'],
  },
  {
    id: ORIGIN.noble,
    name: 'Noble',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.INT, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: 5 },
    ],
    grantsTalentLists: ['noble'],
    grantsAbilityLists: [],
  },
  {
    id: ORIGIN.sanctionedPsykerBiomancer,
    name: 'Sanctioned Psyker: Biomancer',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['psyker', 'sanctionedPsyker', 'psykerBiomancy'],
    grantsAbilityLists: ['psykerBiomancy'],
  },
  {
    id: ORIGIN.sanctionedPsykerDiviner,
    name: 'Sanctioned Psyker: Diviner',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['psyker', 'sanctionedPsyker', 'psykerDivination'],
    grantsAbilityLists: ['psykerDivination'],
  },
  {
    id: ORIGIN.sanctionedPsykerPyromancer,
    name: 'Sanctioned Psyker: Pyromancer',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['psyker', 'sanctionedPsyker', 'psykerPyromancy'],
    grantsAbilityLists: ['psykerPyromancy'],
  },
  {
    id: ORIGIN.sanctionedPsykerSanctic,
    name: 'Sanctioned Psyker: Sanctic',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['psyker', 'sanctionedPsyker', 'psykerSanctic'],
    grantsAbilityLists: ['psykerSanctic'],
  },
  {
    id: ORIGIN.sanctionedPsykerTelepath,
    name: 'Sanctioned Psyker: Telepath',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['psyker', 'sanctionedPsyker', 'psykerTelepathy'],
    grantsAbilityLists: ['psykerTelepathy'],
  },
  {
    id: ORIGIN.arbitratorVigilant,
    name: 'Arbitrator: Vigilant',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.BS, amount: 5 },
      { characteristicId: CHARACTERISTIC.PER, amount: 5 },
    ],
    grantsTalentLists: ['arbitrator'],
    grantsAbilityLists: ['arbitrator'],
  },
  {
    id: ORIGIN.arbitratorCastigator,
    name: 'Arbitrator: Castigator',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.FEL, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['arbitrator'],
    grantsAbilityLists: ['arbitrator'],
  },
  {
    id: ORIGIN.arbitratorSubductor,
    name: 'Arbitrator: Subductor',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.WS, amount: 5 },
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
    ],
    grantsTalentLists: ['arbitrator'],
    grantsAbilityLists: ['arbitrator'],
  },
]
