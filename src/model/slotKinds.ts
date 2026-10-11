export type TalentSlotKind =
  | 'firstArchetypeTalent'
  | 'secondArchetypeTalent'
  | 'exemplarArchetypeTalent'
  | 'commonTalent'

export type AbilitySlotKind =
  | 'firstArchetypeAbility'
  | 'secondArchetypeAbility'
  | 'exemplarArchetypeAbility'

export type IncreaseSlotKind = 'skillIncrease' | 'characteristicIncrease'

/**
 * Picks an upgrade of one ultimate. Each ultimate has its own table. To add one, add its kind here
 * and its bit width to `CHOICE_SLOT_KIND_BITS`.
 */
export type UpgradeSlotKind =
  | 'firearmMasteryUpgrade'
  | 'daringBreachUpgrade'
  | 'dismantlingAttackUpgrade'
  | 'finestHourUpgrade'
  | 'deathWaltzUpgrade'
  | 'dispatchUpgrade'
  | 'unyieldingGuardUpgrade'
  | 'wildHuntUpgrade'
  | 'orchestratedFirestormUpgrade'
  | 'takeAndHoldUpgrade'
  | 'steadySuperiorityUpgrade'
  | 'carnivalOfMiseryUpgrade'

/** A slot kind that holds a user choice, and so takes bits in the URL. */
export type ChoiceSlotKind = TalentSlotKind | AbilitySlotKind | IncreaseSlotKind | UpgradeSlotKind

/**
 * A keystone feature fixed by a schema, such as Run and Gun. Not a choice, and never encoded.
 * `featureKey` is its key in the keystone feature table (`KEYSTONE_FEATURES`).
 */
export interface KeystoneFeatureSlot {
  readonly kind: 'keystoneFeature'
  readonly featureKey: string
}

export type SlotKind = ChoiceSlotKind | KeystoneFeatureSlot['kind']

/** One slot in a schema: a choice slot, by its kind, or a fixed keystone feature. */
export type SchemaSlot = ChoiceSlotKind | KeystoneFeatureSlot

/** Bit widths of every choice slot kind. See Architecture §4.3. */
const CHOICE_SLOT_KIND_BITS: Readonly<Record<ChoiceSlotKind, number>> = {
  firstArchetypeTalent: 10,
  secondArchetypeTalent: 10,
  exemplarArchetypeTalent: 10,
  commonTalent: 10,
  firstArchetypeAbility: 8,
  secondArchetypeAbility: 8,
  exemplarArchetypeAbility: 8,
  skillIncrease: 4,
  characteristicIncrease: 4,
  // Every ultimate has exactly 4 upgrades, so with null they take 3 bits.
  firearmMasteryUpgrade: 3,
  daringBreachUpgrade: 3,
  dismantlingAttackUpgrade: 3,
  finestHourUpgrade: 3,
  deathWaltzUpgrade: 3,
  dispatchUpgrade: 3,
  unyieldingGuardUpgrade: 3,
  wildHuntUpgrade: 3,
  orchestratedFirestormUpgrade: 3,
  takeAndHoldUpgrade: 3,
  steadySuperiorityUpgrade: 3,
  carnivalOfMiseryUpgrade: 3,
}

export function isTalentSlotKind(kind: ChoiceSlotKind): kind is TalentSlotKind {
  return kind.endsWith('Talent')
}

export function isAbilitySlotKind(kind: ChoiceSlotKind): kind is AbilitySlotKind {
  return kind.endsWith('Ability')
}

export function isUpgradeSlotKind(kind: ChoiceSlotKind): kind is UpgradeSlotKind {
  return kind.endsWith('Upgrade')
}

export function isKeystoneFeature(slot: SchemaSlot): slot is KeystoneFeatureSlot {
  return typeof slot === 'object'
}

/** Number of bits a choice of this kind takes in the URL. */
export function choiceSlotBits(kind: ChoiceSlotKind): number {
  if (!Object.hasOwn(CHOICE_SLOT_KIND_BITS, kind)) {
    throw new Error(`Unknown slot kind: ${kind}`)
  }
  return CHOICE_SLOT_KIND_BITS[kind]
}
