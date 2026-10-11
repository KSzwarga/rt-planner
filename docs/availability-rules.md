# Availability Rules

Rules that decide which options each slot offers the user, and which selections are legal.

**Where this fits.** [Architecture §6](./Architecture.md#6-validation) describes **how** validation runs: when the validator runs, the chronological replay from level 1 to 55, nulling, cascades and logging. This document defines **what** the replay checks:

- the character state the rules read, and how each choice changes it ([Character state](#character-state))
- the availability rule for each slot kind ([Slot kinds](#slot-kinds))

Encoding concerns, such as bit widths, table sizes and when to bump the format version, are in [Architecture §4](./Architecture.md#4-bit-layout).

## Principle: one rule, two uses

Each slot kind has a single availability function:

```ts
available(state: CharacterState, slot: SlotRef): Id[]
```

`state` is the character as it stands **just before** the slot, as built by the replay. Both of these use the same function:

- **UI**: the options the user can pick for the slot are exactly `available(state, slot)`.
- **Validator**: a selection is legal if and only if it is in `available(state, slot)`. Otherwise it is nulled.

So the UI can never offer something the validator would remove, and the validator never removes something the UI offered. Talent and ability slots also show options the user can't pick yet ([UI: shown vs. selectable](#ui-shown-vs-selectable)), but what can be picked is still exactly `available`.

## Slot kinds

| Slot kind                                                         | Rules                                                             |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `homeworldId`, `originId`, `triumphId`, `darkestHourId`           | Every entry of the table is always available                      |
| `startingCharacteristicIncreasesIds` (6 static slots)             | [Starting characteristic increases](#starting-characteristic-increases) |
| `characteristicIncrease`                                          | [Increase tables](#increase-tables), [Characteristic increase](#characteristic-increase) |
| `skillIncrease`                                                   | [Increase tables](#increase-tables), [Skill increase](#skill-increase) |
| `firstArchetypeTalent`, `secondArchetypeTalent`, `exemplarArchetypeTalent`, `commonTalent` | [Talents and abilities](#talents-and-abilities) |
| `firstArchetypeAbility`, `secondArchetypeAbility`, `exemplarArchetypeAbility` | [Talents and abilities](#talents-and-abilities)        |
| `*Upgrade` (ultimate upgrades, e.g. `firearmMasteryUpgrade`)      | [Ultimate upgrades](#ultimate-upgrades)                           |
| `keystoneFeature`                                                 | Not a choice. Fixed by the schema, never checked, no effect on the state.                              |

Whether an archetype itself is allowed (second archetype after first, Exemplar) is an archetype-level rule, covered in [Architecture §6](./Architecture.md#6-validation).

---

## Character state

`CharacterState` is everything the availability functions read. It is **derived, never stored**: the replay rebuilds it from the `BuildPlan` after every change, and none of it goes in the URL.

| Field                  | Meaning                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `level`                | Level of the slot being checked                                         |
| `owner`                | Archetype that owns the slot (first, second, Exemplar)                  |
| `origin`, `homeworld`  | From the build                                                          |
| `characteristics`      | Current value of each characteristic (formula below)                   |
| `increaseCounts`       | Times each entry was taken in `characteristicIncrease` / `skillIncrease` slots, keyed by **table and ID** |
| `talentsTaken`, `abilitiesTaken` | IDs taken so far                                              |
| `upgradesTaken`        | Ultimate upgrades picked so far, keyed by **ultimate and ID**           |
| `talentLists`, `abilityLists` | Lists unlocked so far (see [Lists](#lists))                      |

### How each choice changes the state

| Choice                              | Effect on the state                                                       |
| ----------------------------------- | ------------------------------------------------------------------------- |
| Homeworld, origin                   | Apply their `characteristicModifiers`, and unlock their talent and ability lists |
| Starting characteristic increase    | +5 to that characteristic. Does **not** count in `increaseCounts`.        |
| `characteristicIncrease`            | +5 to that characteristic, and count it                                   |
| `skillIncrease`                     | Count it                                                                  |
| Talent                              | Record it as taken, apply its `characteristicModifiers`, unlock its `grantsTalentLists` / `grantsAbilityLists` |
| Ability                             | Record it as taken                                                        |
| Ultimate upgrade                    | Record it as taken                                                        |

The replay applies only **legal** choices, and only after the slot they are in. So anything a choice grants counts only for **later** slots.

### Characteristic values

```
value(c) = 30                                              // every characteristic starts at 30
         + homeworld modifier for c
         + origin modifier for c
         + 5 × (times c is in the 6 starting increases)
         + 5 × (times c was taken in characteristicIncrease slots so far)
         + modifiers for c from talents taken so far
```

Increases always add **5**. Homeworld, origin and talent modifiers vary per entry and are stored as data:

```ts
characteristicModifiers: { characteristicId: Id; amount: number }[];
```

---

## Increase tables

`characteristicIncrease` and `skillIncrease` slots work the same way. Each has its **own table**. Each entry in a table says **what makes it available**, so the rules live on the option itself, not on origins, homeworlds, archetypes or talents.

```ts
interface IncreaseEntry {
  id: Id;                           // 1-based, 0 is null, part of the URL format
  name: string;
  availableForOrigins: Id[];        // every slot, if the build has one of these origins
  availableForHomeworlds: Id[];     // every slot, if the build has one of these homeworlds
  availableForFirstArchetypes: Id[];  // only the slots of these first archetypes
  availableForSecondArchetypes: Id[]; // only the slots of these second archetypes
  availableForTalents: Id[];        // every slot after one of these talents is taken
}
```

First and second archetypes are separate tables with overlapping IDs, so each tier has its own field ([decision 042](./decisions.md#042-increase-availability-per-archetype-tier-and-talent-requirements)). The **Exemplar can improve every characteristic and skill**, so it needs no field: in Exemplar slots, Rule 1 always holds and only the cap applies.

**Implemented:** `CHARACTERISTICS` (`src/gamedata/characteristics.ts`) and `SKILLS` (`src/gamedata/skills.ts`) hold:

- `availableForFirstArchetypes` and `availableForSecondArchetypes`, from each archetype's page on the Rogue Trader fandom wiki.
- `availableForOrigins`, from each origin's *On advancement this Origin makes available* line on the [Origin](https://roguetrader.wiki.fextralife.com/Origin) and [Arbitrator](https://roguetrader.wiki.fextralife.com/Arbitrator) pages. For example, Commissar unlocks FEL and Coercion, and every Sanctioned Psyker unlocks WP and Lore (Warp), which no archetype offers.
- `availableForHomeworlds`, empty for now: homeworlds don't unlock any characteristic or skill yet.

`availableForTalents` is added once its data exists. The rule is `increaseUnavailableReason` / `availableIncreaseIds` in `src/availability/increases.ts`.

Example: Strength is available for the Soldier and Warrior first archetypes, the Vanguard, Arch-Militant and Executioner second archetypes, the Commissar origin, and the Void-born homeworld, or after the talent Mighty Shot has been taken.

```ts
{
  id: 3,
  name: "Strength",
  availableForOrigins: [/* Commissar */],
  availableForHomeworlds: [/* Void-born */],
  availableForFirstArchetypes: [/* Soldier, Warrior */],
  availableForSecondArchetypes: [/* Vanguard, Arch-Militant, Executioner */],
  availableForTalents: [/* Mighty Shot */],
}
```

### Rule 1: source

An entry is available in a slot if **any** of its `availableFor*` conditions holds:

| Condition                | Holds when                                                   |
| ------------------------ | ------------------------------------------------------------ |
| `availableForOrigins`    | The build's origin is listed (applies to every slot)         |
| `availableForHomeworlds` | The build's homeworld is listed (applies to every slot)      |
| `availableForFirstArchetypes`, `availableForSecondArchetypes` | The archetype that **owns the slot** is listed in its tier's field. Always holds in Exemplar slots |
| `availableForTalents`    | A listed talent was taken **before** the slot, in any archetype |

### Rule 2: cumulative cap

Each entry can be taken a limited number of times. The cap is **cumulative** and rises with each archetype:

| By the end of                | Max times one entry can be taken (total so far) |
| ---------------------------- | ----------------------------------------------- |
| First archetype (lvl 1–15)   | 2                                               |
| Second archetype (lvl 16–35) | 4                                               |
| Exemplar (lvl 36–55)         | 6                                               |

An entry is available in a slot only if `increaseCounts` for it is below the cap of the slot's archetype. Each entry is counted separately, and characteristic and skill increases are capped independently. The two tables have overlapping IDs (ID 3 is Strength in one and Carouse in the other), so counts are always keyed by table and ID, never by ID alone.

For example, all of these are legal for STR:

- 2 in the first, 2 in the second, 2 in the Exemplar
- 0 in the first, 4 in the second, 2 in the Exemplar
- 0 in the first, 0 in the second, 6 in the Exemplar

3 in the first archetype is illegal: the third STR increase is not offered there, and it is nulled if present in a link.

### Summary

Entry `e` is available in slot `s` when:

```
(build.origin    ∈ e.availableForOrigins
  OR build.homeworld ∈ e.availableForHomeworlds
  OR owner(s)        ∈ e.availableForFirstArchetypes / e.availableForSecondArchetypes (by tier)
  OR s is an Exemplar slot
  OR any talent taken before s ∈ e.availableForTalents)
AND
count(e taken before s) < cap(archetype of s)
```

## Characteristic increase

Applies to `characteristicIncrease` slots. Uses the characteristic table.

| ID | Characteristic   | Abbr. |
| -- | ---------------- | ----- |
| 1  | Weapon Skill     | WS    |
| 2  | Ballistic Skill  | BS    |
| 3  | Strength         | STR   |
| 4  | Toughness        | TGH   |
| 5  | Agility          | AGI   |
| 6  | Intelligence     | INT   |
| 7  | Perception       | PER   |
| 8  | Willpower        | WP    |
| 9  | Fellowship       | FEL   |

### Starting characteristic increases

The 6 `startingCharacteristicIncreasesIds` use the same table, with their own rules instead of Rules 1 and 2:

- Every characteristic is always available. No origin, homeworld, archetype or talent is needed.
- They do **not** count toward the cap. A build can take STR in its starting increases and still take it twice more in the first archetype.
- **Max 2 of the same characteristic** among the 6. They can be anything from 6 different characteristics to 3 characteristics taken twice each. Once a characteristic has been picked twice, it is no longer offered in the remaining starting slots, and a third copy in a link is nulled.

The rule is `availableStartingIncreaseIds(earlierIds, characteristics)` in `src/availability/startingIncreases.ts`. The validator checks the 6 slots in order, each against the legal slots before it, so the first two copies of a characteristic are kept and any later one is nulled.

## Skill increase

Applies to `skillIncrease` slots. Uses the skill table, with the same rules as characteristic increases.

| ID | Skill            |
| -- | ---------------- |
| 1  | Athletics        |
| 2  | Awareness        |
| 3  | Carouse          |
| 4  | Coercion         |
| 5  | Commerce         |
| 6  | Demolition       |
| 7  | Logic            |
| 8  | Lore (Imperium)  |
| 9  | Lore (Warp)      |
| 10 | Lore (Xenos)     |
| 11 | Medicae          |
| 12 | Persuasion       |
| 13 | Tech-Use         |

IDs in both tables are part of the URL format and must not be reordered.

---

## Talents and abilities

`*Talent` and `*Ability` slots follow the same rules. Each has its **own table** and its **own set of lists**. Everything below says "talent", and it applies to abilities in the same way, using the ability table and ability lists, with one difference: **there are no common abilities**. There is no `common` ability list and no common ability slot. Every ability slot is an archetype ability slot. Abilities have no requirements yet, so an ability in the pool is selectable unless it was already taken. The Exemplar has no abilities of its own, so `exemplarArchetypeAbility` slots offer both of its archetypes' ability lists.

**Implemented:** `src/gamedata/abilities.ts` holds 109 abilities with `id`, `name` and `description`, and `abilityLists.ts` holds 22 lists: one per archetype, one each for the Arbitrator, Commissar, Navy Officer, Astra Militarum Commander and Ministorum Priest origins, and one per psyker discipline. Both are generated from the [wiki's abilities table](https://roguetrader.wiki.fextralife.com/Abilities) by each ability's source, the same way as talents. Origins grant their list through `grantsAbilityLists`, and each Sanctioned Psyker grants its discipline's list. Left out:

- **Keystone abilities and ultimates** (Heroic Acts and Desperate Measures). They are granted, never chosen, and are already keystone features.
- **Overseer, Navigator, Tech-Priest** and other sources outside the planner's scope.

The rule is `abilityOptions` / `availableAbilityIds` in `src/availability/abilities.ts`.

They work differently from increases. An increase entry stores the sources that unlock it (`availableFor*`). For talents, the **sources store lists**, and the talent entry only stores its **requirements**.

Availability is decided in two steps:

1. **Pool**: which talents the slot shows at all, from the lists the build has unlocked.
2. **Requirements**: which shown talents can be selected, from the requirements stored on each talent.

### Talent table

One table holds every talent. Talents that appear in several lists are stored once.

```ts
interface TalentEntry {
  id: Id;                       // 1-based, 0 is null, part of the URL format
  name: string;
  requirements: Requirement[];  // all must hold (AND). Empty = no requirements.
  grantsTalentLists: ListKey[]; // lists unlocked for later slots once this talent is taken
  grantsAbilityLists: ListKey[];
  characteristicModifiers: { characteristicId: Id; amount: number }[];
}
```

**Implemented so far:** `src/gamedata/talents.ts` holds 546 talents with `id`, `name` and `description` (the effect text), generated from the [wiki's talents table](https://roguetrader.wiki.fextralife.com/Talents). IDs follow alphabetical order. Requirements live in their own file (see [Rule 2](#rule-2-requirements-which-shown-talents-are-selectable)). `grantsTalentLists`, `grantsAbilityLists` and `characteristicModifiers` are added once their data exists. The rule is `talentOptions` / `availableTalentIds` in `src/availability/talents.ts`.

### Lists

A list is a named array of talent IDs. It holds no rules, only membership.

```ts
type ListKey = string;          // e.g. "common", "soldier", "commissar"

interface TalentList {
  key: ListKey;
  name: string;
  talentIds: Id[];
}
```

Lists are never encoded, only talent IDs are, so list keys can be strings.

`src/gamedata/talentLists.ts` holds the lists, generated from the wiki's talents table by each talent's source:

| Source on the wiki                            | List                                                     |
| --------------------------------------------- | -------------------------------------------------------- |
| All Archetypes                                | `common`                                                 |
| An archetype, such as Soldier or Assassin     | That archetype's list, such as `soldier` or `assassin`   |
| Exemplar                                      | `exemplar`                                               |
| An origin, such as Arbitrator                 | That origin's list, such as `arbitrator`                 |
| Psyker, Sanctioned Psyker                     | `psyker`, `sanctionedPsyker`                             |
| A psyker discipline, such as Psyker – Pyromancy | `psykerPyromancy`, `psykerBiomancy`, `psykerDivination`, `psykerSanctic`, `psykerTelepathy` |
| A homeworld, such as Hive World               | That homeworld's list, such as `hiveWorld`               |

Talents from other sources, such as Overseer, colony traits, convictions, companion-only talents (including Navigator and Unsanctioned Psyker) and one-off event rewards, are left out. For whether editing lists needs a version bump, see [Architecture §4.1](./Architecture.md#41-version).

Lists come from these sources:

| Source        | Field                                    | Where the list applies                        |
| ------------- | ---------------------------------------- | --------------------------------------------- |
| Always        | the `common` list (talents only)         | Every talent slot                             |
| Origin        | `grantsTalentLists`                      | Every talent slot                             |
| Homeworld     | `grantsTalentLists`                      | Every talent slot                             |
| Talent        | `grantsTalentLists`                      | Every talent slot **after** the talent is taken, in any archetype |
| Archetype     | `archetypeTalentList` (exactly one)      | Only that archetype's **archetype talent** slots |

Example: the Soldier archetype has `archetypeTalentList: "soldier"`. The `soldier` list is just the IDs of the Soldier talents.

```ts
const soldierTalents: TalentList = {
  key: "soldier",
  name: "Soldier talents",
  talentIds: [/* Bring It Down!, Steady Superiority, ... */],
};
```

### Rule 1: pool (which talents are shown)

The slot kind decides which archetype list counts, if any:

| Slot kind                    | Pool                                       |
| ---------------------------- | ------------------------------------------ |
| `firstArchetypeTalent`       | first archetype's talent list ∪ build lists  |
| `secondArchetypeTalent`      | second archetype's talent list ∪ build lists |
| `exemplarArchetypeTalent`    | Exemplar's talent list ∪ build lists         |
| `commonTalent`               | build lists                                  |
| `firstArchetypeAbility`      | first archetype's ability list ∪ build ability lists  |
| `secondArchetypeAbility`     | second archetype's ability list ∪ build ability lists |
| `exemplarArchetypeAbility`   | Exemplar's ability list ∪ build ability lists         |

**Build lists** are the lists in the state's `talentLists` / `abilityLists`, granted by the origin, the homeworld and earlier talents, plus `common` for talents.

- An archetype list applies only to **its own archetype's slots**. The first archetype's list never applies in second-archetype or Exemplar slots, and vice versa. A Soldier talent is never in the pool of a `commonTalent` slot, unless some build list also contains it.
- The pool is a union. A talent is in the pool if **any** applicable list contains it.
- A talent outside the pool is not shown at all.

### Rule 2: requirements (which shown talents are selectable)

Requirements are stored per talent. A talent in the pool is **selectable** only if every one of its requirements holds against the [character state](#character-state) just before the slot.

They live in `src/gamedata/talentRequirements.ts`, keyed by talent ID, apart from the generated `talents.ts`, so regenerating the talent table from the wiki never loses them ([decision 042](./decisions.md#042-increase-availability-per-archetype-tier-and-talent-requirements)). `talentRequirements(id)` returns a talent's requirements, or none. So far: Heavy Armour Proficiency needs 45 Strength, and each *Advanced Skill* talent needs its *Base Skill* talent.

```ts
type Requirement =
  | { kind: "level"; min: number }                          // level of the slot >= min
  | { kind: "talent"; id: Id }                              // talent taken before the slot
  | { kind: "ability"; id: Id }                             // ability taken before the slot
  | { kind: "characteristic"; id: Id; min: number }         // characteristic value >= min
  | { kind: "anyOf"; of: Requirement[] };                   // at least one holds (OR)
```

The top-level array is AND, and `anyOf` gives OR. They nest, so "Talent A or Talent B" is:

```ts
requirements: [
  { kind: "level", min: 10 },
  { kind: "anyOf", of: [{ kind: "talent", id: A }, { kind: "talent", id: B }] },
]
```

New requirement kinds can be added to the union without touching the rest of the design. Characteristic values come from the [formula](#characteristic-values).

**No repeats.** Talents and abilities can each be taken **at most once** per build. A talent already taken in an earlier slot is not selectable again.

### UI: shown vs. selectable

A talent slot shows the **whole pool**:

- Selectable talents are shown normally.
- Talents with unmet requirements are shown **in red** and cannot be picked. The UI lists which requirements are unmet.

The availability function returns both:

```ts
interface TalentOption {
  id: Id;
  lists: ListKey[];       // the slot's pool lists that contain it; the UI groups by these
  selectable: boolean;
  unmet: Requirement[];   // empty when selectable
}

talentOptions(state: CharacterState, slot: SlotRef): TalentOption[]   // the pool
```

`available(state, slot)` is the selectable subset: `talentOptions(...).filter(o => o.selectable)`. The validator uses only that subset. A red talent in a link is nulled, just like a talent outside the pool.

How the options are grouped and displayed is described in [UI Design: Option list](./ui-design.md#2-option-list).

### Summary

Talent `t` is selectable in slot `s` when:

```
(t ∈ common
  OR t ∈ lists of build.origin
  OR t ∈ lists of build.homeworld
  OR t ∈ lists of any talent taken before s
  OR (s is an archetype slot AND t ∈ archetype list of owner(s)))
AND every requirement of t holds just before s
AND t has not been taken before s
```

The first part decides whether `t` is shown. The last two decide whether it is red. For abilities, drop the `common` line.

---

## Ultimate upgrades

Applies to `*Upgrade` slots, such as `firearmMasteryUpgrade`. Each ultimate has its **own table** of exactly **4** upgrades, IDs 1–4.

- No origin, homeworld, archetype, talent or requirement is needed.
- **Each upgrade can be picked only once.** An upgrade already in `upgradesTaken` for that ultimate is not available again. For example, with `firearmMasteryUpgrade` at levels 9 and 15, level 15 offers the 3 upgrades not picked at level 9.

`upgradesTaken` is keyed by **ultimate and ID**, because every ultimate's table uses IDs 1–4.
