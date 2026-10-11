import { CHARACTERISTIC } from './characteristics'
import type { OriginEntry } from './types'

export const ORIGINS: readonly OriginEntry[] = [
  {
    id: 1,
    name: 'Astra Militarum Commander',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.BS, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: 5 },
    ],
    grantsTalentLists: ['astraMilitarumCommander'],
    grantsAbilityLists: [],
  },
  {
    id: 2,
    name: 'Commissar',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.BS, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: 5 },
    ],
    grantsTalentLists: ['commissar'],
    grantsAbilityLists: [],
  },
  {
    id: 3,
    name: 'Crime Lord',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.WS, amount: 5 },
      { characteristicId: CHARACTERISTIC.PER, amount: 5 },
    ],
    grantsTalentLists: ['crimeLord'],
    grantsAbilityLists: [],
  },
  {
    id: 4,
    name: 'Ministorum Priest',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.WP, amount: 10 },
    ],
    grantsTalentLists: ['ministorumPriest'],
    grantsAbilityLists: [],
  },
  {
    id: 5,
    name: 'Navy Officer',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.PER, amount: 5 },
    ],
    grantsTalentLists: ['navyOfficer'],
    grantsAbilityLists: [],
  },
  {
    id: 6,
    name: 'Noble',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.INT, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: 5 },
    ],
    grantsTalentLists: ['noble'],
    grantsAbilityLists: [],
  },
  {
    id: 7,
    name: 'Sanctioned Psyker: Biomancer',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['sanctionedPsykerBiomancer'],
    grantsAbilityLists: [],
  },
  {
    id: 8,
    name: 'Sanctioned Psyker: Diviner',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['sanctionedPsykerDiviner'],
    grantsAbilityLists: [],
  },
  {
    id: 9,
    name: 'Sanctioned Psyker: Pyromancer',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['sanctionedPsykerPyromancer'],
    grantsAbilityLists: [],
  },
  {
    id: 10,
    name: 'Sanctioned Psyker: Sanctic',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['sanctionedPsykerSanctic'],
    grantsAbilityLists: [],
  },
  {
    id: 11,
    name: 'Sanctioned Psyker: Telepath',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['sanctionedPsykerTelepath'],
    grantsAbilityLists: [],
  },
  {
    id: 12,
    name: 'Arbitrator: Vigilant',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.BS, amount: 5 },
      { characteristicId: CHARACTERISTIC.PER, amount: 5 },
    ],
    grantsTalentLists: ['arbitrator'],
    grantsAbilityLists: [],
  },
  {
    id: 13,
    name: 'Arbitrator: Castigator',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.FEL, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['arbitrator'],
    grantsAbilityLists: [],
  },
  {
    id: 14,
    name: 'Arbitrator: Subductor',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.WS, amount: 5 },
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
    ],
    grantsTalentLists: ['arbitrator'],
    grantsAbilityLists: [],
  },
]
