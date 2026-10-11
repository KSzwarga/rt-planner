import type { KeystoneFeatureSlot } from '../model/slotKinds'
import type { KeystoneFeatureEntry } from './types'

/**
 * Every keystone feature, by key. Keystone features are never encoded, so they need no numeric IDs
 * and can be added or reordered freely.
 */
export const KEYSTONE_FEATURES = {
  runAndGun: { name: 'Run and Gun', isUltimate: false },
  revelInSlaughter: { name: 'Revel in Slaughter', isUltimate: false },
  firearmMastery: { name: 'Firearm Mastery', isUltimate: true },
  charge: { name: 'Charge', isUltimate: false },
  endure: { name: 'Endure', isUltimate: false },
  daringBreach: { name: 'Daring Breach', isUltimate: true },
  analyseEnemies: { name: 'Analyse Enemies', isUltimate: false },
  exposeWeakness: { name: 'Expose Weakness', isUltimate: false },
  dismantlingAttack: { name: 'Dismantling Attack', isUltimate: true },
  voiceOfCommand: { name: 'Voice of Command', isUltimate: false },
  bringItDown: { name: 'Bring it Down!', isUltimate: false },
  finestHour: { name: 'Finest Hour!', isUltimate: true },
  bladeDance: { name: 'Blade Dance', isUltimate: false },
  deathFromAbove: { name: 'Death From Above', isUltimate: false },
  deathWaltz: { name: 'Death Waltz', isUltimate: true },
  // Second archetypes. Where the Heroic Act and Desperate Measures ultimates differ, both are named.
  seekTheOpening: { name: 'Seek the Opening', isUltimate: false },
  dispatch: { name: 'Dispatch', isUltimate: true },
  unyieldingBeacon: { name: 'Unyielding Beacon', isUltimate: false },
  unyieldingGuard: { name: 'Unyielding Guard', isUltimate: true },
  huntDownThePrey: { name: 'Hunt Down the Prey', isUltimate: false },
  wildHunt: { name: 'Wild Hunt', isUltimate: true },
  pressTheAdvantage: { name: 'Press the Advantage', isUltimate: false },
  orchestratedFirestorm: { name: 'Orchestrated Firestorm / Last Volley', isUltimate: true },
  combatTactics: { name: 'Combat Tactics', isUltimate: false },
  takeAndHold: { name: 'Take and Hold', isUltimate: true },
  versatility: { name: 'Versatility', isUltimate: false },
  steadySuperiority: { name: 'Steady Superiority / Heroic Sacrifice', isUltimate: true },
  whereItHurts: { name: 'Where It Hurts', isUltimate: false },
  carnivalOfMisery: { name: 'Carnival of Misery', isUltimate: true },
  /** Level 20 of every second archetype grants an additional action point. */
  additionalActionPoint: { name: 'Additional AP', isUltimate: false },
} as const satisfies Readonly<Record<string, KeystoneFeatureEntry>>

export type KeystoneFeatureKey = keyof typeof KEYSTONE_FEATURES

/** A schema slot holding this keystone feature. Only takes keys that exist in the table. */
export function keystoneFeature(featureKey: KeystoneFeatureKey): KeystoneFeatureSlot {
  return { kind: 'keystoneFeature', featureKey }
}
