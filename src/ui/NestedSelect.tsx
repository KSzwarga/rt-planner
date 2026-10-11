import {
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { TableEntry } from '../gamedata/types'
import type { Id } from '../model/buildPlan'
import { containsId, type MenuGroup, toMenuItems } from './menuItems'
import './NestedSelect.css'

interface NestedSelectProps {
  readonly label: string
  readonly entries: readonly TableEntry[]
  readonly value: Id | null
  readonly onChange: (id: Id) => void
}

/** Which menu item should receive focus after the next render. */
type PendingFocus = { readonly level: 'top' | 'sub'; readonly index: number }

/**
 * A labelled dropdown over a game data table. Entries named `Group: Option` open as a nested
 * menu under their group (see `toMenuItems`).
 *
 * Keyboard: arrows move, Right / Enter / Space open a group, Left / Escape close it, Escape closes
 * the dropdown, and Tab leaves it.
 */
export function NestedSelect({ label, entries, value, onChange }: NestedSelectProps) {
  const items = useMemo(() => toMenuItems(entries), [entries])
  const selectedName = entries.find((entry) => entry.id === value)?.name

  const [isOpen, setIsOpen] = useState(false)
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(null)
  const [isSubmenuFlipped, setIsSubmenuFlipped] = useState(false)

  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const submenuRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const subItemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const pendingFocus = useRef<PendingFocus | null>(null)

  const openGroup = openGroupIndex === null ? null : (items[openGroupIndex] as MenuGroup)

  useEffect(() => {
    const target = pendingFocus.current
    if (!target) return
    pendingFocus.current = null
    const refs = target.level === 'top' ? itemRefs : subItemRefs
    refs.current[target.index]?.focus()
  })

  // A submenu opens to the right of its group, or to the left when that would leave the viewport.
  useLayoutEffect(() => {
    const submenu = submenuRef.current
    if (!submenu) return
    setIsSubmenuFlipped(false)
    if (getComputedStyle(submenu).position !== 'absolute') return
    const parentRect = submenu.parentElement!.getBoundingClientRect()
    const fitsRight = parentRect.right + submenu.offsetWidth <= document.documentElement.clientWidth
    setIsSubmenuFlipped(!fitsRight)
  }, [openGroupIndex])

  function selectedIndexIn(options: readonly { readonly id: Id }[]): number {
    return Math.max(0, options.findIndex((option) => option.id === value))
  }

  function openMenu() {
    setIsOpen(true)
    setOpenGroupIndex(null)
    pendingFocus.current = {
      level: 'top',
      index: Math.max(0, items.findIndex((item) => containsId(item, value))),
    }
  }

  function closeMenu(returnFocus: boolean) {
    setIsOpen(false)
    setOpenGroupIndex(null)
    if (returnFocus) triggerRef.current?.focus()
  }

  function openSubmenu(index: number, focusInside: boolean) {
    setOpenGroupIndex(index)
    if (focusInside) {
      pendingFocus.current = { level: 'sub', index: selectedIndexIn((items[index] as MenuGroup).options) }
    }
  }

  function closeSubmenu() {
    if (openGroupIndex === null) return
    pendingFocus.current = { level: 'top', index: openGroupIndex }
    setOpenGroupIndex(null)
  }

  function select(id: Id) {
    onChange(id)
    closeMenu(true)
  }

  function handleTriggerKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu()
    }
  }

  function handleBlur(event: FocusEvent) {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) closeMenu(false)
  }

  /** Arrow, Home and End movement through a list of focusable items. Returns whether it handled the key. */
  function moveFocus(event: KeyboardEvent, refs: (HTMLButtonElement | null)[], index: number): boolean {
    const count = refs.length
    const nextIndex = {
      ArrowDown: (index + 1) % count,
      ArrowUp: (index - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }[event.key]
    if (nextIndex === undefined) return false
    event.preventDefault()
    refs[nextIndex]?.focus()
    return true
  }

  function handleItemKeyDown(event: KeyboardEvent, index: number) {
    if (moveFocus(event, itemRefs.current.slice(0, items.length), index)) {
      setOpenGroupIndex(null)
      return
    }
    if (event.key === 'ArrowRight' && items[index].kind === 'group') {
      event.preventDefault()
      openSubmenu(index, true)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu(true)
    }
  }

  function handleSubItemKeyDown(event: KeyboardEvent, index: number) {
    if (moveFocus(event, subItemRefs.current.slice(0, openGroup?.options.length ?? 0), index)) return
    if (event.key === 'ArrowLeft' || event.key === 'Escape') {
      event.preventDefault()
      closeSubmenu()
    }
  }

  return (
    <div className="nested-select" ref={rootRef} onBlur={handleBlur}>
      <button
        type="button"
        className="nested-select__trigger"
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => (isOpen ? closeMenu(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="nested-select__label">{label}</span>
        <span className={selectedName ? 'nested-select__value' : 'nested-select__value nested-select__value--empty'}>
          {selectedName ?? 'Select'}
        </span>
        <Chevron className="nested-select__chevron" />
      </button>

      {isOpen && (
        <ul className="nested-select__menu" id={menuId} role="menu" aria-label={label}>
          {items.map((item, index) => {
            const isCurrent = containsId(item, value)
            const className = isCurrent ? 'nested-select__item nested-select__item--current' : 'nested-select__item'

            if (item.kind === 'option') {
              return (
                <li key={`option-${item.id}`} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isCurrent}
                    className={className}
                    ref={(element) => {
                      itemRefs.current[index] = element
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(item.id)}
                    onKeyDown={(event) => handleItemKeyDown(event, index)}
                    onMouseEnter={(event) => {
                      setOpenGroupIndex(null)
                      event.currentTarget.focus({ preventScroll: true })
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              )
            }

            const isGroupOpen = openGroupIndex === index
            return (
              <li key={`group-${item.label}`} role="none" className="nested-select__group">
                <button
                  type="button"
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded={isGroupOpen}
                  className={isGroupOpen ? `${className} nested-select__item--open` : className}
                  ref={(element) => {
                    itemRefs.current[index] = element
                  }}
                  onClick={() => openSubmenu(index, true)}
                  onKeyDown={(event) => handleItemKeyDown(event, index)}
                  onMouseEnter={(event) => {
                    openSubmenu(index, false)
                    event.currentTarget.focus({ preventScroll: true })
                  }}
                >
                  {item.label}
                  <Chevron className="nested-select__group-chevron" />
                </button>

                {isGroupOpen && (
                  <ul
                    className={
                      isSubmenuFlipped ? 'nested-select__submenu nested-select__submenu--flipped' : 'nested-select__submenu'
                    }
                    ref={submenuRef}
                    role="menu"
                    aria-label={item.label}
                  >
                    {item.options.map((option, subIndex) => {
                      const isSelected = option.id === value
                      return (
                        <li key={option.id} role="none">
                          <button
                            type="button"
                            role="menuitemradio"
                            aria-checked={isSelected}
                            className={
                              isSelected ? 'nested-select__item nested-select__item--current' : 'nested-select__item'
                            }
                            ref={(element) => {
                              subItemRefs.current[subIndex] = element
                            }}
                            onClick={() => select(option.id)}
                            onKeyDown={(event) => handleSubItemKeyDown(event, subIndex)}
                            onMouseEnter={(event) => event.currentTarget.focus({ preventScroll: true })}
                          >
                            {option.label}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Chevron({ className }: { readonly className: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
