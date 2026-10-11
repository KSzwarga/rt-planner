# Architecture

Technical description of RT Planner: how the app is built, what state it keeps, and how that state is encoded into the URL.

This document covers the codec and **how** validation runs (§6). **What** is legal in each slot, and the derived character state those rules read, is in [Availability Rules](./availability-rules.md). How the screens present the build is in [UI Design](./ui-design.md). How the app is tested is in [Testing](./test.md). Architectural decisions are logged in [Decisions](./decisions.md). That log is **append-only**: add new entries, and never edit or delete earlier ones.

## 1. Stack and runtime model

The app runs entirely in the browser. It has **no backend, no database and no server-side state**.

| Concern                | Choice                            |
| ---------------------- | --------------------------------- |
| UI                     | React                             |
| Language               | TypeScript                        |
| Build / dev            | Vite                              |
| Unit and service tests | Vitest ([Testing](./test.md))     |
| E2E tests              | Playwright ([Testing](./test.md)) |
| Lint                   | oxlint                            |

The build output is a static bundle that can be hosted on any static file host.

### Source layout

Keep this tree up to date when adding, moving or removing modules. Tests sit next to the code they test ([Testing](./test.md)).

```
src/
├── model/                    Shared types used by the codec, validator and UI
│   ├── buildPlan.ts          Id, Choice, BuildPlan (§3), emptyBuildPlan
│   ├── schema.ts             Schema (§4.3), choiceSlots: the encoded slots in order
│   └── slotKinds.ts          Slot kinds and their bit widths (§4.3)
├── codec/                    BuildPlan ⇄ URL string (§2, §4, §5)
│   ├── codec.ts              encodeBuild, decodeBuild, ArchetypeSchemas
│   ├── layout.ts             Format version and fixed field widths (§4.1, §4.2)
│   ├── bits.ts               BitWriter, BitReader over a BigInt
│   ├── base64url.ts          Bits ⇄ base64url text
│   └── errors.ts             DecodeError
├── gamedata/                 Game data tables. IDs are part of the URL format (§4.2)
│   ├── types.ts              Entry types for every table
│   ├── characteristics.ts    Characteristics (WS = 1 … FEL = 9), CHARACTERISTIC ID constants
│   ├── homeworlds.ts         Homeworlds: modifiers, granted talent and ability lists
│   ├── origins.ts            Origins: same shape as homeworlds
│   ├── triumphs.ts           Triumphs: id and name
│   ├── darkestHours.ts       Darkest hours: id and name
│   ├── firstArchetypes.ts    First archetypes: schema (levels 1–15), lists, allowed second archetypes
│   └── secondArchetypes.ts   Second archetypes: schema (levels 16–35), lists
├── App.tsx, main.tsx         React entry point
e2e/                          Playwright end-to-end tests
```

## 2. State persistence: the URL

The only persisted state is the **URL**. A build is serialized into a compact bitstream, held as a `BigInt` used as a bitset, and written into the URL as **base64** (URL-safe alphabet, no padding). Sharing a build means sharing the link. Opening a link decodes the build.

Goals of the encoding:

- **Minimal size**: each field takes only as many bits as its table needs. Fields are packed back to back with no byte alignment, so one byte can hold parts of several choices.
- **IDs only**: the URL stores identifiers, never names, descriptions or derived values. Everything derived from the choices, such as characteristic values, lives in the [character state](./availability-rules.md#character-state) and is never stored.
- **Schema-driven**: the meaning of most of the bitstream depends on the selected archetypes, so the decoder reads the archetype IDs first and then uses the matching schema to read the rest.
- **Order-preserving**: fields and choices are written in one fixed order (§4.4), and the decoder relies on that order. It is never rearranged to save space.
- **Partial builds round-trip**: any incomplete build encodes and decodes losslessly (see §5).
- **Versioned**: the stream starts with a format version (§4.1).

### Encoding pipeline

```
BuildPlan ──► BitWriter (BigInt) ──► base64url ──► URL
URL ──► base64url ──► BitReader (BigInt) ──► raw BuildPlan ──► Validator ──► BuildPlan
```

Decoding always ends with validation, so illegal selections are set to null before the `BuildPlan` reaches the app. The same validator also runs on every edit (§6).

Each base64url character holds 6 bits. The bitstream is packed tightly, and only the **last character** is padded with zero bits up to a 6-bit boundary.

The first field written takes the most significant bits, so the stream reads left to right in the order of §4.4, and the first character holds the version. The encoder drops trailing `A` characters (all zero bits), because the decoder reads missing bits as null (§5).

The codec doesn't own any game data. `encodeBuild` and `decodeBuild` take the archetype schemas as an `ArchetypeSchemas` argument: the first- and second-archetype schemas by ID, and the Exemplar schema.

The encoder expects a well-formed build, such as the validator's output, and throws on anything else. That includes an ID too wide for its field, an unknown archetype, or a choices array whose length doesn't match its schema. The decoder throws `DecodeError` only when the link can't be read at all: a character outside base64url, or an unsupported version (§4.1). Anything it can read, it returns unvalidated.

## 3. The persisted object: `BuildPlan`

```ts
interface BuildPlan {
  characterId: Id | null;
  homeworldId: Id | null;
  originId: Id | null;
  triumphId: Id | null;
  darkestHourId: Id | null;
  startingCharacteristicIncreasesIds: (Id | null)[];

  firstArchetypeId: Id | null;
  firstArchetypeChoicesIds: (Choice | null)[];

  secondArchetypeId: Id | null;
  secondArchetypeChoicesIds: (Choice | null)[];

  isExemplar: boolean;
  exemplarArchetypeChoicesIds: (Choice | null)[];
}
```

Every field is nullable. `null` is a valid value everywhere (see §5).

`Id` is a table entry ID. `Choice` is an `Id` in the table of its slot's kind (§4.3). Each `*ChoicesIds` array has **one entry per choice slot** of its archetype's schema, in encoding order (`choiceSlots`). Keystone features are not choices, so they have no entry. An archetype that is not selected has an empty array, and so does the Exemplar when `isExemplar` is false.

A null `characterId` means **the Rogue Trader**, the main character and the default. The Rogue Trader has no entry in the characters table. That table holds only the companions, starting at ID 1. So no character chosen and the Rogue Trader are the same build.

`BuildPlan` holds choices only. The validator derives a `CharacterState` from it (§6), which is defined in [Availability Rules: Character state](./availability-rules.md#character-state).

### Static vs. schema-dependent fields

- **Static pools**: `characterId`, `homeworldId`, `originId`, `triumphId`, `darkestHourId` and `startingCharacteristicIncreasesIds` always choose from the same tables, so their bit widths are constant.
- **Schema-dependent**: the `*ChoicesIds` arrays have no fixed layout. Their length, slot order and per-slot widths come from the **archetype schema**.

### Archetypes

A character has up to three archetypes:

| Archetype  | Levels  | How it is chosen                                       | Encoded as                 |
| ---------- | ------- | ------------------------------------------------------ | -------------------------- |
| First      | 1–15    | User picks from the **first-archetype** table          | 4-bit `firstArchetypeId`   |
| Second     | 16–35   | User picks from the **second-archetype** table         | 4-bit `secondArchetypeId`  |
| Exemplar   | 36–55   | Always the same archetype, the only possible third one | 1-bit `isExemplar` flag    |

The first and second archetypes come from **different tables**, so the same ID means a different archetype in each field. For example, first archetypes include Soldier and Warrior, and second archetypes include Master Tactician and Executioner.

**Every archetype has its own schema**, covering only its own level range.

The Exemplar has its own schema, like any other archetype. Because there is only one possible third archetype, there is no ID to store, only whether the character has it.

## 4. Bit layout

### 4.1 Version

The stream starts with a **4-bit format version** (values `1–15`). Change the version whenever a table, schema or layout changes in a way that would make old links decode differently. The decoder reads the version first and dispatches to the matching layout. It rejects unknown versions instead of guessing.

Data that only affects **availability** doesn't change decoding, so it needs no version bump. That covers talent and ability lists, requirements, characteristic modifiers and `availableFor*` fields. Changing it can make old links load with some choices nulled by the validator (§6).

### 4.2 Fixed-width fields

| Field                                     | Table                     | Options (excl. null) | Bits |
| ----------------------------------------- | ------------------------- | -------------------- | ---- |
| `characterId`                             | Characters (companions; null = Rogue Trader) | ≤ 31  | 5    |
| `homeworldId`                             | Homeworlds                | ≤ 15                 | 4    |
| `originId`                                | Origins                   | ≤ 31                 | 5    |
| `triumphId`                               | Triumphs                  | ≤ 15                 | 4    |
| `darkestHourId`                           | Darkest hours             | ≤ 15                 | 4    |
| `startingCharacteristicIncreasesIds[0..5]`| Characteristics (shared)  | 9                    | 4 × 6 = 24 |
| `firstArchetypeId`                        | First archetypes          | ≤ 15                 | 4    |
| `secondArchetypeId`                       | Second archetypes         | ≤ 15                 | 4    |
| `isExemplar`                              | —                         | flag                 | 1    |

`startingCharacteristicIncreasesIds` always has exactly **6** entries, and uses the same characteristics table as the `characteristicIncrease` schema slot. Which values they can hold: [Starting characteristic increases](./availability-rules.md#starting-characteristic-increases).

### 4.3 Archetype schemas

An archetype schema is a level-to-slots progression table. This example is a first archetype (levels 1–15):

```ts
const progression = {
  1: ["runAndGunKeystoneFeature"],
  2: ["skillIncrease"],
  3: ["revelInSlaughterKeystoneFeature"],
  4: ["firearmMasteryUltimateKeystoneFeature", "firstArchetypeTalent"],
  5: ["characteristicIncrease", "firstArchetypeTalent"],
  6: ["characteristicIncrease", "firstArchetypeAbility"],
  7: ["characteristicIncrease", "commonTalent"],
  8: ["firstArchetypeTalent", "skillIncrease"],
  9: ["firearmMasteryUpgrade"],
  10: ["firstArchetypeTalent", "characteristicIncrease"],
  11: ["firstArchetypeAbility", "skillIncrease"],
  12: ["characteristicIncrease", "commonTalent"],
  13: ["firstArchetypeTalent", "commonTalent"],
  14: ["commonTalent", "skillIncrease"],
  15: ["firearmMasteryUpgrade"],
};
```

The encoder and decoder both walk the schema in a fixed order: levels ascending, and slots in array order within each level. The level-up screen draws the same schema as a [radial menu](./ui-design.md#1-radial-progression). The slot **kind** sets the bit width and the lookup table. Which entries of that table a slot accepts is a separate question, answered by the slot kind's availability rule:

| Slot kind                                              | Table                                | Options (excl. null) | Bits | Encoded? | Availability |
| ------------------------------------------------------ | ------------------------------------ | -------------------- | ---- | -------- | ------------ |
| `*KeystoneFeature` (incl. `firearmMasteryUltimateKeystoneFeature`) | Shared keystone-feature table | —          | —    | **No**   | Fixed by schema |
| `*Talent` (`firstArchetypeTalent`, `secondArchetypeTalent`, `exemplarArchetypeTalent`, `commonTalent`) | Shared talent table (all archetypes) | ≤ 511 | 9 | Yes | [Talents and abilities](./availability-rules.md#talents-and-abilities) |
| `*Ability` (`firstArchetypeAbility`, …)                | Shared ability table (all archetypes)| ≤ 255                | 8    | Yes      | [Talents and abilities](./availability-rules.md#talents-and-abilities) |
| `skillIncrease`                                        | Shared skill table                   | 13                   | 4    | Yes      | [Increase tables](./availability-rules.md#increase-tables) |
| `characteristicIncrease`                               | Shared characteristic table          | 9                    | 4    | Yes      | [Increase tables](./availability-rules.md#increase-tables) |
| `*Upgrade` (ultimate upgrades, e.g. `firearmMasteryUpgrade`) | Own table per ultimate          | 4                    | 3    | Yes      | [Ultimate upgrades](./availability-rules.md#ultimate-upgrades) |

**Keystone features are never encoded.** They are fixed for a given schema and the user cannot change them, so they have no entry in the choices arrays. Anything that shows them, such as the level-up screen, reads them straight from the schema. The Firearm Mastery ultimate is a keystone feature.

Slot kinds fall into two groups:

- **Shared tables**: talents, abilities, skills and characteristics. Each of these has its own table, and that one table serves every archetype, so an ID means the same talent, ability, skill or characteristic whichever archetype references it.
- **Own tables**: ultimate upgrades such as `firearmMasteryUpgrade`, and any other kinds still to be defined. Each has a table of its own, so an ID only has meaning within that ultimate. Every ultimate upgrade table has exactly 4 options, so with null they always take 3 bits. Other own-table kinds set their bit width separately.

All `*Talent` kinds encode the same way, as a 9-bit talent ID. They differ only in availability.

To add a new slot kind, give it a table and a bit width, register it in the slot-kind lookup (`src/model/slotKinds.ts`) used by the encoder, decoder and validator, and define its availability function in [Availability Rules](./availability-rules.md#slot-kinds). Adding one changes the layout, so bump the format version (§4.1).

### 4.4 Stream order

```
version                          4 bits
characterId                      5
homeworldId                      4
originId                         5
triumphId                        4
darkestHourId                    4
startingCharacteristicIncreasesIds[6]  4 each (24)
firstArchetypeId                 4
firstArchetypeChoicesIds[]       ← layout from schema(firstArchetypeId)
secondArchetypeId                4
secondArchetypeChoicesIds[]      ← layout from schema(secondArchetypeId)
isExemplar                       1
exemplarArchetypeChoicesIds[]    ← layout from Exemplar schema
```

This order is part of the format. Fields are concatenated in exactly this sequence, each directly after the previous one with no gaps or alignment.

Conditional sections:

- An archetype ID always comes **before** its choices, because the decoder needs it to pick the schema. If the ID is null, there is no schema, so that archetype contributes **zero bits** of choices.
- If `isExemplar` is `0`, the Exemplar choices contribute **zero bits**.
- If an archetype ID is not in its table, the decoder has no schema, so it can't tell where that archetype's choices end. It stops reading there. That archetype and everything after it decode as empty, and a warning is logged. The fields before it are kept. This is the only unknown ID the codec handles itself. Every other one is left for the validator to null (§6).

## 5. Nulls and incomplete builds

- **Value `0` is reserved for null** in every field and every table, so real table entries start at `1`.
- For `characterId`, null is not an unset choice. It means the Rogue Trader (§3).
- Any field may be null. A build with nothing selected, or a half-finished one, must encode and decode back to an identical `BuildPlan`.
- When the reader reaches the end of the stream, it returns `0` (null). So a build whose last fields are all null can drop them from the URL without changing the decoded result, and the encoder always does. This only trims the **end** of the stream and never reorders fields.

## 6. Validation

Illegal selections are **set to null**. This section covers when and how that happens. Whether a selection in a slot is legal is decided by the slot kind's availability function, defined in [Availability Rules](./availability-rules.md). The UI uses the same function, so the two can never disagree ([Principle: one rule, two uses](./availability-rules.md#principle-one-rule-two-uses)).

Validation is not part of the codec. It is a standalone step that runs in two places:

- **On decode**: a link with an illegal selection still opens. The rest of the build loads, and the offending choices come back empty.
- **On every change**: whenever the user changes a choice, the validator runs over the whole updated build. Changing an earlier choice can make later ones illegal (for example, removing a characteristic increase that a later talent requires), and those later choices are nulled straight away.

Every update to the build goes through the same path: `apply change → validate → store state → encode to URL`. So the in-memory build and the URL never hold an illegal selection.

A selection is illegal when:

- its ID does not exist in the table for its field or slot kind. For example, `firstArchetypeId = 14` fits in 4 bits, but there is no first archetype 14.
- it is not in `available(state, slot)` for its slot, evaluated **at that point in the progression** (see Chronological check below). For example: a Soldier talent in a `commonTalent` slot, an increase over its cap, a talent already taken, or a talent whose requirements aren't met yet. The rules for each slot kind are in [Availability Rules](./availability-rules.md#slot-kinds).
- it is a `secondArchetypeId` that a **non-null** `firstArchetypeId` does not allow. The second archetype is then nulled, and all of its choices with it. If `firstArchetypeId` is null, the second archetype is kept, so a link can carry a second archetype on its own. This is the only case where an archetype itself is nulled. `isExemplar` is never nulled, because the Exemplar is available to every archetype (see below).

Individual choices are checked the same way in **every** archetype (first, second and Exemplar). Any illegal choice is always nulled, even when the archetype it belongs to stays.

### Validation vs. editing

The validator decides what a build may **hold**. The UI decides what the user may **change** (on the [archetype pick screen](./ui-design.md#archetype-pick-screen)). These are deliberately different for the second archetype and the Exemplar:

| Archetype | Held (validator)                                                     | Changed (UI)                                                          |
| --------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Second    | Kept unless a non-null first archetype doesn't allow it. A link can open with a second archetype and no first. | Only once a first archetype is selected, and only to one it allows. |
| Exemplar  | Never nulled, on load or on any change. It stays even if the second archetype is nulled or cleared. | Only once a second archetype is selected. |

In both cases, the **choices inside** the archetype are still validated and nulled individually (§6).

Within a slot, the UI lets the user pick exactly what the validator accepts. Talent and ability slots also show options that can't be picked yet ([UI: shown vs. selectable](./availability-rules.md#ui-shown-vs-selectable)). How they are displayed is described under [Level-up screen](./ui-design.md#level-up-screen).

### Logging

Every nulled selection is logged as a warning (`console.warn`). The log says which field or slot was nulled, the ID it held, and why: unknown ID, second archetype not allowed, or not available in the slot. For the last one, the log includes the reason from the availability rule, such as no source, over the cap, already taken, or which requirements are unmet. Nulling never throws: the build always loads, and the log is there to help debug bad links and data issues.

### Chronological check

Availability can depend on earlier choices, such as characteristic increases or other talents. So whether a choice is legal depends on **where** in the progression it is taken, not only on the build as a whole. The validator replays the build in chronological order and keeps a running [`CharacterState`](./availability-rules.md#character-state). That section defines the fields of the state and what each choice adds to it.

1. Build the initial state from the static choices: character (null = Rogue Trader), homeworld, origin, triumph, darkest hour, and the 6 starting characteristic increases. Each starting increase is checked against its own rules before it is applied.
2. Walk the levels in order: 1–15 (first archetype), 16–35 (second archetype), 36–55 (Exemplar). Within each level, walk the slots in schema order.
3. At each slot, check the selection against the state accumulated **so far**, using `available(state, slot)`:
   - If it's legal, apply it to the state.
   - If it's illegal, set it to null and don't apply it.
4. Keystone features are skipped. They are fixed by the schema, not choices, and they never change the state.

Because a nulled choice is never applied, anything later that depended on it fails its own check and is nulled too. A single pass handles these cascades, and no fixed-point iteration is needed.

A choice is legal only if its prerequisites were met **before** it, either at an earlier level or in an earlier slot of the same level. For example, at level 5 (`["characteristicIncrease", "firstArchetypeTalent"]`) the talent can rely on the characteristic increase taken just before it, but not the other way round. A prerequisite taken later does not count, even if the finished build would have it.

The validator is pure: `(BuildPlan) → BuildPlan`. Running it on its own output changes nothing, so it is safe to run after every change.
