import { CHARACTERISTIC } from './characteristics'
import type { HomeworldEntry } from './types'

/**
 * Homeworlds with a choice have one entry per option, sharing everything else:
 * - Forge World: one entry per augmentation (Subskin Armor, Locomotion System, Analytic System).
 * - Imperial World: one entry per characteristic it can raise (every characteristic but WS and BS).
 */
export const HOMEWORLDS: readonly HomeworldEntry[] = [
  {
    id: 1,
    name: 'Death World',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.STR, amount: 5 },
      { characteristicId: CHARACTERISTIC.AGI, amount: 5 },
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.INT, amount: -5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: -5 },
    ],
    grantsTalentLists: ['deathWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 2,
    name: 'Forge World: Subskin Armor',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.INT, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: -5 },
    ],
    grantsTalentLists: ['forgeWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 3,
    name: 'Forge World: Locomotion System',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.INT, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: -5 },
    ],
    grantsTalentLists: ['forgeWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 4,
    name: 'Forge World: Analytic System',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.TGH, amount: 5 },
      { characteristicId: CHARACTERISTIC.INT, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: -5 },
    ],
    grantsTalentLists: ['forgeWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 5,
    name: 'Fortress World',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.PER, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: -5 },
    ],
    grantsTalentLists: ['fortressWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 6,
    name: 'Hive World',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.AGI, amount: 5 },
      { characteristicId: CHARACTERISTIC.FEL, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: -5 },
    ],
    grantsTalentLists: ['hiveWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 7,
    name: 'Imperial World: STR',
    characteristicModifiers: [{ characteristicId: CHARACTERISTIC.STR, amount: 10 }],
    grantsTalentLists: ['imperialWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 8,
    name: 'Imperial World: TGH',
    characteristicModifiers: [{ characteristicId: CHARACTERISTIC.TGH, amount: 10 }],
    grantsTalentLists: ['imperialWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 9,
    name: 'Imperial World: AGI',
    characteristicModifiers: [{ characteristicId: CHARACTERISTIC.AGI, amount: 10 }],
    grantsTalentLists: ['imperialWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 10,
    name: 'Imperial World: INT',
    characteristicModifiers: [{ characteristicId: CHARACTERISTIC.INT, amount: 10 }],
    grantsTalentLists: ['imperialWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 11,
    name: 'Imperial World: PER',
    characteristicModifiers: [{ characteristicId: CHARACTERISTIC.PER, amount: 10 }],
    grantsTalentLists: ['imperialWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 12,
    name: 'Imperial World: WP',
    characteristicModifiers: [{ characteristicId: CHARACTERISTIC.WP, amount: 10 }],
    grantsTalentLists: ['imperialWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 13,
    name: 'Imperial World: FEL',
    characteristicModifiers: [{ characteristicId: CHARACTERISTIC.FEL, amount: 10 }],
    grantsTalentLists: ['imperialWorld'],
    grantsAbilityLists: [],
  },
  {
    id: 14,
    name: 'Voidborn',
    characteristicModifiers: [
      { characteristicId: CHARACTERISTIC.STR, amount: -5 },
      { characteristicId: CHARACTERISTIC.INT, amount: 5 },
      { characteristicId: CHARACTERISTIC.WP, amount: 5 },
    ],
    grantsTalentLists: ['voidborn'],
    grantsAbilityLists: [],
  },
]
