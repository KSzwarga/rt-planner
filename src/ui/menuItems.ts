import type { TableEntry } from '../gamedata/types'
import type { Id } from '../model/buildPlan'

/** Separates the group from the option in an entry name, as in `Imperial World: STR`. */
export const GROUP_SEPARATOR = ': '

/** An entry the user can pick. */
export interface MenuOption {
  readonly kind: 'option'
  readonly id: Id
  readonly label: string
}

/** Entries that share a group name, shown as a nested menu. */
export interface MenuGroup {
  readonly kind: 'group'
  readonly label: string
  readonly options: readonly MenuOption[]
}

export type MenuItem = MenuOption | MenuGroup

/**
 * Turns table entries into dropdown items. Entries named `Group: Option` are gathered into one
 * group, placed where its first entry is, and labelled by the option part. Other entries stay
 * top-level options labelled by their full name. Table order is kept otherwise.
 */
export function toMenuItems(entries: readonly TableEntry[]): MenuItem[] {
  const items: MenuItem[] = []
  const groups = new Map<string, MenuOption[]>()

  for (const entry of entries) {
    const separatorIndex = entry.name.indexOf(GROUP_SEPARATOR)
    if (separatorIndex === -1) {
      items.push({ kind: 'option', id: entry.id, label: entry.name })
      continue
    }

    const groupLabel = entry.name.slice(0, separatorIndex)
    const option: MenuOption = {
      kind: 'option',
      id: entry.id,
      label: entry.name.slice(separatorIndex + GROUP_SEPARATOR.length),
    }
    const groupOptions = groups.get(groupLabel)
    if (groupOptions) {
      groupOptions.push(option)
    } else {
      const options = [option]
      groups.set(groupLabel, options)
      items.push({ kind: 'group', label: groupLabel, options })
    }
  }

  return items
}

/** Whether a menu item is, or contains, the option with this ID. */
export function containsId(item: MenuItem, id: Id | null): boolean {
  if (id === null) return false
  return item.kind === 'option' ? item.id === id : item.options.some((option) => option.id === id)
}
