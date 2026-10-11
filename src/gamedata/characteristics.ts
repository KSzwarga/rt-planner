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

export const CHARACTERISTICS: readonly CharacteristicEntry[] = [
  { id: CHARACTERISTIC.WS, abbreviation: 'WS', name: 'Weapon Skill' },
  { id: CHARACTERISTIC.BS, abbreviation: 'BS', name: 'Ballistic Skill' },
  { id: CHARACTERISTIC.STR, abbreviation: 'STR', name: 'Strength' },
  { id: CHARACTERISTIC.TGH, abbreviation: 'TGH', name: 'Toughness' },
  { id: CHARACTERISTIC.AGI, abbreviation: 'AGI', name: 'Agility' },
  { id: CHARACTERISTIC.INT, abbreviation: 'INT', name: 'Intelligence' },
  { id: CHARACTERISTIC.PER, abbreviation: 'PER', name: 'Perception' },
  { id: CHARACTERISTIC.WP, abbreviation: 'WP', name: 'Willpower' },
  { id: CHARACTERISTIC.FEL, abbreviation: 'FEL', name: 'Fellowship' },
]
