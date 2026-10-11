import { describe, expect, it } from 'vitest'
import type { TableEntry } from '../../src/gamedata/types'
import { containsId, toMenuItems } from '../../src/ui/menuItems'

const entries: readonly TableEntry[] = [
  { id: 1, name: 'Noble' },
  { id: 2, name: 'Psyker: Biomancer' },
  { id: 3, name: 'Crime Lord' },
  { id: 4, name: 'Psyker: Telepath' },
]

describe('toMenuItems', () => {
  it('keeps entries without a group as options labelled by their full name', () => {
    expect(toMenuItems([{ id: 7, name: 'Crime Lord' }])).toEqual([{ kind: 'option', id: 7, label: 'Crime Lord' }])
  })

  it('gathers `Group: Option` entries into one group at the position of its first entry', () => {
    expect(toMenuItems(entries)).toEqual([
      { kind: 'option', id: 1, label: 'Noble' },
      {
        kind: 'group',
        label: 'Psyker',
        options: [
          { kind: 'option', id: 2, label: 'Biomancer' },
          { kind: 'option', id: 4, label: 'Telepath' },
        ],
      },
      { kind: 'option', id: 3, label: 'Crime Lord' },
    ])
  })

  it('splits only at the first separator', () => {
    expect(toMenuItems([{ id: 1, name: 'A: B: C' }])).toEqual([
      { kind: 'group', label: 'A', options: [{ kind: 'option', id: 1, label: 'B: C' }] },
    ])
  })
})

describe('containsId', () => {
  const [noble, psyker] = toMenuItems(entries)

  it('matches an option by its own ID', () => {
    expect(containsId(noble, 1)).toBe(true)
    expect(containsId(noble, 2)).toBe(false)
  })

  it('matches a group by any of its options', () => {
    expect(containsId(psyker, 4)).toBe(true)
    expect(containsId(psyker, 1)).toBe(false)
  })

  it('matches nothing for null', () => {
    expect(containsId(noble, null)).toBe(false)
    expect(containsId(psyker, null)).toBe(false)
  })
})
