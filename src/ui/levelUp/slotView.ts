import { abilityOptions } from '../../availability/abilities'
import type { ArchetypeTier, CharacterState } from '../../availability/characterState'
import { characteristicValue, INCREASE_AMOUNT } from '../../availability/characterState'
import { hasIncreaseSource, INCREASE_CAPS } from '../../availability/increases'
import { requirementText } from '../../availability/requirementText'
import { talentOptions } from '../../availability/talents'
import { KEYSTONE_FEATURES } from '../../gamedata/keystoneFeatures'
import type { AbbreviatedEntry, ListKey } from '../../gamedata/types'
import type { BuildPlan, Choice, Id } from '../../model/buildPlan'
import { choiceSlots, type Schema } from '../../model/schema'
import {
  type ChoiceSlotKind,
  isAbilitySlotKind,
  isTalentSlotKind,
  isUpgradeSlotKind,
  type UpgradeSlotKind,
} from '../../model/slotKinds'
import { CHOICES_FIELD, stateBeforeSlot, talentRuleTables } from '../../validation/replay'
import { GAME_TABLES, type ValidatorTables } from '../../validation/validator'

/** One option of a slot, as the option list and the detail panel show it. */
export interface OptionView {
  readonly id: Id
  readonly name: string
  readonly abbreviation: string
  /** What the option is and where it comes from, e.g. "Talent · Soldier, Common". */
  readonly typeLabel: string
  readonly description: string
  readonly selectable: boolean
  /** Why it can't be picked, in words. Shown in red. Empty when it can be picked. */
  readonly problems: readonly string[]
  readonly isCurrent: boolean
}

/** The options from one list, shown together. Talents and abilities have one group per pool list. */
export interface OptionGroup {
  readonly key: string
  readonly name: string
  readonly options: readonly OptionView[]
}

/** Everything the option list and detail panel need for one choice slot. */
export interface ChoiceSlotView {
  readonly level: number
  readonly kind: ChoiceSlotKind
  readonly title: string
  readonly groups: readonly OptionGroup[]
  /** The slot's current choice, or null when it is empty. */
  readonly current: OptionView | null
}

const SLOT_TITLES: Record<string, string> = {
  commonTalent: 'Common talents',
  characteristicIncrease: 'Characteristic increase',
  skillIncrease: 'Skill increase',
}

/**
 * How a choice slot looks on the ring: its icon when empty and its colour when filled. Archetype
 * talent slots of every tier look alike, and so do all ultimate upgrade slots.
 */
export type SlotCategory = 'talent' | 'commonTalent' | 'ability' | 'upgrade' | 'skill' | 'characteristic'

export function slotCategory(kind: ChoiceSlotKind): SlotCategory {
  if (kind === 'commonTalent') return 'commonTalent'
  if (isTalentSlotKind(kind)) return 'talent'
  if (isAbilitySlotKind(kind)) return 'ability'
  if (isUpgradeSlotKind(kind)) return 'upgrade'
  return kind === 'characteristicIncrease' ? 'characteristic' : 'skill'
}

export function slotTitle(kind: ChoiceSlotKind): string {
  if (kind in SLOT_TITLES) return SLOT_TITLES[kind]
  if (isTalentSlotKind(kind)) return 'Talents'
  if (isAbilitySlotKind(kind)) return 'Abilities'
  return 'Ultimate upgrade'
}

/** The schema of one of the build's archetypes. */
export function tierSchema(plan: BuildPlan, tier: ArchetypeTier, tables: ValidatorTables = GAME_TABLES): Schema | null {
  switch (tier) {
    case 'first':
      return tables.firstArchetypes.find((entry) => entry.id === plan.firstArchetypeId)?.schema ?? null
    case 'second':
      return tables.secondArchetypes.find((entry) => entry.id === plan.secondArchetypeId)?.schema ?? null
    case 'exemplar':
      return plan.isExemplar ? tables.exemplarSchema : null
  }
}

/**
 * What a choice slot offers, worked out from the choices before it only (Availability Rules), so it
 * offers exactly what the validator would keep there. `plan` must be validated.
 */
export function choiceSlotView(
  plan: BuildPlan,
  tier: ArchetypeTier,
  index: number,
  tables: ValidatorTables = GAME_TABLES,
): ChoiceSlotView {
  const schema = tierSchema(plan, tier, tables)
  const slot = schema === null ? undefined : choiceSlots(schema)[index]
  if (slot === undefined) throw new Error(`The build has no ${tier} archetype slot ${index}`)

  const state = stateBeforeSlot(plan, { tier, index }, tables)
  const currentId = plan[CHOICES_FIELD[tier]][index] ?? null
  const groups = optionGroups(slot.kind, { tier, level: slot.level }, state, currentId, tables)
  const current = groups.flatMap((group) => group.options).find((option) => option.isCurrent) ?? null
  return { level: slot.level, kind: slot.kind, title: slotTitle(slot.kind), groups, current }
}

/** The table a slot kind's choices are IDs in. */
export function optionTable(kind: ChoiceSlotKind, tables: ValidatorTables = GAME_TABLES): readonly AbbreviatedEntry[] {
  if (isTalentSlotKind(kind)) return tables.talents
  if (isAbilitySlotKind(kind)) return tables.abilities
  if (isUpgradeSlotKind(kind)) return tables.upgrades
  return kind === 'characteristicIncrease' ? tables.characteristics : tables.skills
}

/** The entry a choice picks, for its node on the ring. */
export function choiceEntry(kind: ChoiceSlotKind, id: Choice, tables: ValidatorTables = GAME_TABLES): AbbreviatedEntry {
  return optionTable(kind, tables).find((entry) => entry.id === id) ?? { id, name: `#${id}`, abbreviation: '?' }
}

function optionGroups(
  kind: ChoiceSlotKind,
  slot: { readonly tier: ArchetypeTier; readonly level: number },
  state: CharacterState,
  currentId: Choice | null,
  tables: ValidatorTables,
): OptionGroup[] {
  if (isTalentSlotKind(kind)) {
    const options = talentOptions(state, { ...slot, kind }, talentRuleTables(tables))
    const listName = (key: ListKey) => tables.talentLists.find((list) => list.key === key)?.name ?? key
    return groupByList(options, listName, (option) => {
      const talent = tables.talents.find((entry) => entry.id === option.id)
      return {
        id: option.id,
        name: talent?.name ?? `#${option.id}`,
        abbreviation: talent?.abbreviation ?? '?',
        typeLabel: `Talent · ${option.lists.map(listName).join(', ')}`,
        description: talent?.description ?? '',
        selectable: option.selectable,
        problems: [
          ...(option.isTaken ? ['Already taken'] : []),
          ...option.unmet.map((requirement) => `Requires ${requirementText(requirement, tables)}`),
        ],
        isCurrent: option.id === currentId,
      }
    })
  }

  if (isAbilitySlotKind(kind)) {
    const options = abilityOptions(state, { ...slot, kind }, tables.abilityLists)
    const listName = (key: ListKey) => tables.abilityLists.find((list) => list.key === key)?.name ?? key
    return groupByList(options, listName, (option) => {
      const ability = tables.abilities.find((entry) => entry.id === option.id)
      return {
        id: option.id,
        name: ability?.name ?? `#${option.id}`,
        abbreviation: ability?.abbreviation ?? '?',
        typeLabel: `Ability · ${option.lists.map(listName).join(', ')}`,
        description: ability?.description ?? '',
        selectable: option.selectable,
        problems: option.isTaken ? ['Already taken'] : [],
        isCurrent: option.id === currentId,
      }
    })
  }

  if (isUpgradeSlotKind(kind)) {
    const taken = state.upgradesTaken.get(kind)
    const options = tables.upgrades.map((upgrade) => ({
      id: upgrade.id,
      name: upgrade.name,
      abbreviation: upgrade.abbreviation,
      typeLabel: `Ultimate upgrade · ${ultimateName(kind)}`,
      description: '',
      selectable: !taken?.has(upgrade.id),
      problems: taken?.has(upgrade.id) ? ['Already taken'] : [],
      isCurrent: upgrade.id === currentId,
    }))
    return [{ key: kind, name: 'Upgrades', options }]
  }

  const isCharacteristic = kind === 'characteristicIncrease'
  const entries = isCharacteristic ? tables.characteristics : tables.skills
  const counts = isCharacteristic ? state.characteristicIncreaseCounts : state.skillIncreaseCounts
  const cap = INCREASE_CAPS[slot.tier]
  // Entries nothing unlocks yet are left out. Those over the cap are shown, in red.
  const options = entries
    .filter((entry) => hasIncreaseSource(entry, state, slot.tier))
    .map((entry) => {
      const count = counts.get(entry.id) ?? 0
      const value = characteristicValue(state, entry.id)
      return {
        id: entry.id,
        name: entry.name,
        abbreviation: entry.abbreviation,
        typeLabel: isCharacteristic ? 'Characteristic increase' : 'Skill increase',
        description: isCharacteristic
          ? `${entry.name}: ${value} → ${value + INCREASE_AMOUNT}. Taken ${count} of ${cap} times so far.`
          : `Taken ${count} of ${cap} times so far.`,
        selectable: count < cap,
        problems: count < cap ? [] : [`Already taken ${cap} times, the most allowed by the end of this archetype`],
        isCurrent: entry.id === currentId,
      }
    })
  return [{ key: kind, name: isCharacteristic ? 'Characteristics' : 'Skills', options }]
}

/** One group per pool list, in pool order. An option in several lists appears in each group. */
function groupByList<T extends { readonly lists: readonly ListKey[] }>(
  options: readonly T[],
  listName: (key: ListKey) => string,
  toView: (option: T) => OptionView,
): OptionGroup[] {
  const groups = new Map<ListKey, OptionView[]>()
  for (const option of options) {
    const view = toView(option)
    for (const key of option.lists) {
      groups.set(key, [...(groups.get(key) ?? []), view])
    }
  }
  return [...groups].map(([key, groupOptions]) => ({ key, name: listName(key), options: groupOptions }))
}

/** The name of the ultimate an upgrade slot upgrades: `firearmMasteryUpgrade` upgrades Firearm Mastery. */
function ultimateName(kind: UpgradeSlotKind): string {
  const featureKey = kind.replace(/Upgrade$/, '') as keyof typeof KEYSTONE_FEATURES
  return KEYSTONE_FEATURES[featureKey]?.name ?? 'Ultimate'
}
