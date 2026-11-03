import { upgradedUltimate } from '../gamedata/keystoneFeatures'
import { UPGRADES } from '../gamedata/upgrades'
import type { Id } from '../model/buildPlan'
import type { UpgradeSlotKind } from '../model/slotKinds'
import type { CharacterState } from './characterState'

/** Every ultimate has exactly these 4 upgrades (Availability Rules: Ultimate upgrades). */
export const UPGRADE_IDS: readonly Id[] = UPGRADES.map((upgrade) => upgrade.id)

/**
 * Whether an upgrade slot can't take anything yet because its ultimate depends on the familiar, and
 * no familiar was picked before it.
 */
export function upgradeNeedsFamiliar(state: CharacterState, kind: UpgradeSlotKind): boolean {
  return upgradedUltimate(kind)?.dependsOnFamiliar === true && state.familiar === null
}

/**
 * The upgrades an upgrade slot can take: its ultimate's 4, minus those already taken. None while the
 * ultimate waits for a familiar. Switching familiar keeps the upgrades: they become the new
 * familiar's.
 */
export function availableUpgradeIds(state: CharacterState, kind: UpgradeSlotKind): Id[] {
  if (upgradeNeedsFamiliar(state, kind)) return []
  const taken = state.upgradesTaken.get(kind)
  return UPGRADE_IDS.filter((id) => !taken?.has(id))
}
