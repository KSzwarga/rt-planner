import { UPGRADES } from '../gamedata/upgrades'
import type { Id } from '../model/buildPlan'
import type { UpgradeSlotKind } from '../model/slotKinds'
import type { CharacterState } from './characterState'

/** Every ultimate has exactly these 4 upgrades (Availability Rules: Ultimate upgrades). */
export const UPGRADE_IDS: readonly Id[] = UPGRADES.map((upgrade) => upgrade.id)

/** The upgrades an upgrade slot can take: its ultimate's 4, minus those already taken. */
export function availableUpgradeIds(state: CharacterState, kind: UpgradeSlotKind): Id[] {
  const taken = state.upgradesTaken.get(kind)
  return UPGRADE_IDS.filter((id) => !taken?.has(id))
}
