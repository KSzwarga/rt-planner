# UI Design

Brief description of the two screens. The mock-ups in [`design/`](../design) are **concepts**: they show the layout, not final names or icons.

What the user may pick is never decided here. Options come from the availability functions in [Availability Rules](./availability-rules.md), and every change goes through the validator ([Architecture §6](./Architecture.md#6-validation)). This document only covers how that is presented.

## Screens

| Screen                                         | Purpose                                                    |
| ---------------------------------------------- | ---------------------------------------------------------- |
| [Archetype pick](#archetype-pick-screen)       | Choose the static choices, starting increases, and the first archetype, second archetype and Exemplar |
| [Level-up](#level-up-screen)                   | Fill in one archetype's level progression                 |

Selecting an archetype opens its level-up screen. **Return** goes back to the archetype pick screen.

Every edit on either screen follows the same path: `apply change → validate → store state → encode to URL` ([Architecture §6](./Architecture.md#6-validation)).

---

## Archetype pick screen

![Archetype pick screen](../design/archetype-selection.png)

Top to bottom: the static choices, the starting characteristic increases, then the three archetype rows.

### Static choices

Four dropdowns, two per line: homeworld, origin, triumph and darkest hour. The labels in the mock-up are placeholders. There is no character dropdown, because the first version supports only the Rogue Trader ([Vision](./00-vision.md#first-version)).

### Starting characteristic increases

One cell for each of the 9 characteristics (WS, BS, STR, TGH, AGI, INT, PER, WP, FEL). Each cell has two pips, one for each time that characteristic is taken among the 6 `startingCharacteristicIncreasesIds`. The rules (any characteristic, at most twice each) are in [Starting characteristic increases](./availability-rules.md#starting-characteristic-increases).

### Archetype rows

Three stacked rows, one per archetype tier:

| Row      | Contents                                    | Unlocked when                                   |
| -------- | ------------------------------------------- | ----------------------------------------------- |
| First    | Every first archetype                       | Always                                          |
| Second   | Every second archetype                      | A first archetype is selected, and only for the second archetypes it allows |
| Exemplar | The single Exemplar                         | A second archetype is selected                  |

- The **selected** archetype in each row is highlighted (orange ring).
- **Locked** archetypes are shown in red and cannot be picked, using the same convention as unselectable talents.
- A second archetype or Exemplar loaded from a link is shown as selected even while its row is locked. The rules for what a build may hold versus what the user may change are in [Architecture §6: Validation vs. editing](./Architecture.md#validation-vs-editing).

## Level-up screen

![Level-up screen](../design/ui-levelup-conspect.png)

Three panels, left to right.

### 1. Radial progression

The archetype's schema ([Architecture §4.3](./Architecture.md#43-archetype-schemas)) laid out as a ring around the archetype emblem and name.

- One node per slot, in level order around the ring.
- When a level has more than one slot, its nodes are joined by a line (outer and inner node).
- Keystone features are fixed nodes (icon, orange ring). They show what they are but cannot be changed.
- The node being edited is highlighted. Clicking a node opens its options in the middle panel.
- An empty node is a null choice. A choice nulled by the validator also shows up as empty.

### 2. Option list

Lists the options for the selected slot, titled by slot kind (Talents, Abilities, Characteristic increase, …).

For talent and ability slots, options are **grouped by the list they come from**, with a divider between groups ([Lists](./availability-rules.md#lists)):

1. The owning archetype's list (archetype slots only)
2. Common talents (talent slots only)
3. Origin lists
4. Homeworld lists
5. Lists granted by earlier talents, in the order those talents were taken

Only lists in the slot's [pool](./availability-rules.md#rule-1-pool-which-talents-are-shown) are shown. A talent that is in more than one of those lists appears in each group. Picking either one picks the same talent.

Options that can't be picked yet are shown **in red** ([UI: shown vs. selectable](./availability-rules.md#ui-shown-vs-selectable)). The current choice is highlighted.

### 3. Detail panel

Shows the option under the cursor or currently selected: icon, name, type, and description. If it has unmet requirements, a red **Requirements** box lists each one.
