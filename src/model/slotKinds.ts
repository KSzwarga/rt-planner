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

/** Picks an upgrade of one ultimate, e.g. `firearmMasteryUpgrade`. Each ultimate has its own table. */
export type UpgradeSlotKind = `${string}Upgrade`

/** A fixed entry of a schema, e.g. `runAndGunKeystoneFeature`. Not a choice, and never encoded. */
export type KeystoneFeatureSlotKind = `${string}KeystoneFeature`

/** A slot kind that holds a user choice, and so takes bits in the URL. */
export type ChoiceSlotKind = TalentSlotKind | AbilitySlotKind | IncreaseSlotKind | UpgradeSlotKind

export type SlotKind = ChoiceSlotKind | KeystoneFeatureSlotKind

/** Bit widths of the kinds with a fixed name. See Architecture §4.3. */
const FIXED_SLOT_KIND_BITS: Readonly<Record<TalentSlotKind | AbilitySlotKind | IncreaseSlotKind, number>> = {
  firstArchetypeTalent: 9,
  secondArchetypeTalent: 9,
  exemplarArchetypeTalent: 9,
  commonTalent: 9,
  firstArchetypeAbility: 8,
  secondArchetypeAbility: 8,
  exemplarArchetypeAbility: 8,
  skillIncrease: 4,
  characteristicIncrease: 4,
}

/** Every ultimate has exactly 4 upgrades, so with null they take 3 bits. */
const UPGRADE_BITS = 3

export function isKeystoneFeature(kind: SlotKind): kind is KeystoneFeatureSlotKind {
  return kind.endsWith('KeystoneFeature')
}

/** Number of bits a choice of this kind takes in the URL. */
export function choiceSlotBits(kind: ChoiceSlotKind): number {
  if (Object.hasOwn(FIXED_SLOT_KIND_BITS, kind)) {
    return FIXED_SLOT_KIND_BITS[kind as keyof typeof FIXED_SLOT_KIND_BITS]
  }
  if (kind.endsWith('Upgrade')) {
    return UPGRADE_BITS
  }
  throw new Error(`Unknown slot kind: ${kind}`)
}
