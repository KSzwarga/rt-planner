import type { KeystoneFeatureSlot } from '../model/slotKinds'
import type { KeystoneFeatureEntry } from './types'

/**
 * Every keystone feature, by key. Keystone features are never encoded, so they need no numeric IDs
 * and can be added or reordered freely.
 */
export const KEYSTONE_FEATURES = {
  runAndGun: { name: 'Run and Gun', abbreviation: 'RG', isUltimate: false },
  revelInSlaughter: { name: 'Revel in Slaughter', abbreviation: 'RS', isUltimate: false },
  firearmMastery: { name: 'Firearm Mastery', abbreviation: 'FM', isUltimate: true },
  charge: { name: 'Charge', abbreviation: 'CHG', isUltimate: false },
  endure: { name: 'Endure', abbreviation: 'END', isUltimate: false },
  daringBreach: { name: 'Daring Breach', abbreviation: 'DB', isUltimate: true },
  analyseEnemies: { name: 'Analyse Enemies', abbreviation: 'AE', isUltimate: false },
  exposeWeakness: { name: 'Expose Weakness', abbreviation: 'EW', isUltimate: false },
  dismantlingAttack: { name: 'Dismantling Attack', abbreviation: 'DA', isUltimate: true },
  voiceOfCommand: { name: 'Voice of Command', abbreviation: 'VC', isUltimate: false },
  bringItDown: { name: 'Bring it Down!', abbreviation: 'BID', isUltimate: false },
  finestHour: { name: 'Finest Hour!', abbreviation: 'FH', isUltimate: true },
  bladeDance: { name: 'Blade Dance', abbreviation: 'BD', isUltimate: false },
  deathFromAbove: { name: 'Death From Above', abbreviation: 'DFA', isUltimate: false },
  deathWaltz: { name: 'Death Waltz', abbreviation: 'DW', isUltimate: true },
  // Second archetypes. Where the Heroic Act and Desperate Measures ultimates differ, both are named.
  seekTheOpening: { name: 'Seek the Opening', abbreviation: 'STO', isUltimate: false },
  dispatch: { name: 'Dispatch', abbreviation: 'DSP', isUltimate: true },
  unyieldingBeacon: { name: 'Unyielding Beacon', abbreviation: 'UB', isUltimate: false },
  unyieldingGuard: { name: 'Unyielding Guard', abbreviation: 'UG', isUltimate: true },
  huntDownThePrey: { name: 'Hunt Down the Prey', abbreviation: 'HDP', isUltimate: false },
  wildHunt: { name: 'Wild Hunt', abbreviation: 'WH', isUltimate: true },
  pressTheAdvantage: { name: 'Press the Advantage', abbreviation: 'PTA', isUltimate: false },
  orchestratedFirestorm: { name: 'Orchestrated Firestorm / Last Volley', abbreviation: 'OF', isUltimate: true },
  combatTactics: { name: 'Combat Tactics', abbreviation: 'CT', isUltimate: false },
  takeAndHold: { name: 'Take and Hold', abbreviation: 'TAH', isUltimate: true },
  versatility: { name: 'Versatility', abbreviation: 'VER', isUltimate: false },
  steadySuperiority: { name: 'Steady Superiority / Heroic Sacrifice', abbreviation: 'SS', isUltimate: true },
  whereItHurts: { name: 'Where It Hurts', abbreviation: 'WIH', isUltimate: false },
  carnivalOfMisery: { name: 'Carnival of Misery', abbreviation: 'COM', isUltimate: true },
  /** Level 20 of every second archetype grants an additional action point. */
  additionalActionPoint: { name: 'Additional AP', abbreviation: 'AP', isUltimate: false },
} as const satisfies Readonly<Record<string, KeystoneFeatureEntry>>

export type KeystoneFeatureKey = keyof typeof KEYSTONE_FEATURES

/** A schema slot holding this keystone feature. Only takes keys that exist in the table. */
export function keystoneFeature(featureKey: KeystoneFeatureKey): KeystoneFeatureSlot {
  return { kind: 'keystoneFeature', featureKey }
}
