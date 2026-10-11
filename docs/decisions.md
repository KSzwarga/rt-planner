# Decisions

A chronological log of decisions made during development that affect the architecture.

## Rules for this file

- **Append only.** New decisions go at the bottom with the next number.
- **Never edit or delete an existing entry**, not even to fix or reverse it. To change a decision, add a new entry that says which entry it supersedes.
- This applies to humans and agents alike. Agents may only add new entries.
- Log a decision when it changes the URL format, the `BuildPlan` shape, the validation rules, or the overall structure of the app. Keep [Architecture](./Architecture.md) and [Vision](./00-vision.md) in sync with the current state. This file records how the project got there.

### Entry template

```md
## NNN. Title

- **Date:** YYYY-MM-DD
- **Status:** Accepted | Superseded by NNN
- **Context:** Why the decision was needed.
- **Decision:** What was decided.
- **Consequences:** What follows from it, including trade-offs.
```

---

## 001. Fully client-side app, state in the URL

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Builds need to be saved and shared without accounts or hosting costs.
- **Decision:** React + TypeScript + Vite, tested with Vitest. No backend and no database. The build is encoded into the URL.
- **Consequences:** Static hosting only. The URL format becomes a public contract.

## 002. Bit-packed `BigInt` encoding in base64url

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** URLs should stay short.
- **Decision:** Store only IDs, packed back to back in a `BigInt` bitset with the minimum width per table, and written as base64url. Field order is fixed, and only the last character is padded. Keystone features are not encoded.
- **Consequences:** The decoder depends on exact field order and widths.

## 003. Value 0 means null everywhere

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Incomplete builds must be encodable and decodable.
- **Decision:** Every field is nullable, and `0` is reserved for null in every table. Reading past the end of the stream returns null.
- **Consequences:** Real table IDs start at 1. Trailing nulls can be dropped from the URL.

## 004. Format version prefix

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Changes to tables or schemas would silently break old links.
- **Decision:** The stream starts with a 4-bit format version. Unknown versions are rejected.
- **Consequences:** Any layout-affecting change must bump the version.

## 005. Schema-driven archetype choices

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Each archetype grants different slots per level.
- **Decision:** Each archetype has its own schema. Its ID is encoded before its choices, and the schema defines the layout of those choices. First and second archetypes come from separate tables. The Exemplar is the only possible third archetype and is stored as a 1-bit flag. Talents (9 bits), abilities (8 bits), skills (4 bits) and characteristics (4 bits) use shared tables. Upgrade kinds such as `firearmMasteryUpgrade` (3 bits) have their own tables.
- **Consequences:** A null archetype contributes no choice bits.

## 006. Illegal selections are nulled by a standalone validator

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Links can contain bad data, and edits can invalidate later choices.
- **Decision:** A pure validator replays the build chronologically (levels 1–15 first, 16–35 second, 36–55 Exemplar; slots in schema order) and nulls illegal selections. It runs on decode and after every change, and logs each nulling with `console.warn`.
- **Consequences:** The in-memory build and the URL never hold an illegal selection. A dependent choice is cascade-nulled in a single pass.

## 007. Archetype nulling rules

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Links may carry archetypes without their predecessors.
- **Decision:** The second archetype is nulled only when a non-null first archetype does not allow it. The Exemplar is never nulled, even if the second archetype is removed. The UI allows changing the second archetype only when a first is selected, and the Exemplar only when a second is selected. Choices inside any archetype are still validated individually.
- **Consequences:** What a build may hold (validator) and what the user may change (UI) are deliberately different.

## 008. One availability function per slot kind, shared by the UI and the validator

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** The options offered to the user and the validation rules must never disagree.
- **Decision:** Each slot kind defines `available(state, slot)`, evaluated against the chronological character state just before the slot. The UI offers exactly that set. The validator treats a selection as legal if and only if it is in that set. Rules are documented in [Availability Rules](./availability-rules.md).
- **Consequences:** Rules live in one place. The UI and the validator cannot drift apart.

## 009. Characteristic increase rules

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Characteristic increases are restricted by build choices and capped.
- **Decision:** A characteristic is available if granted by the origin, the homeworld, the owning archetype (its own slots only), or a talent taken earlier (any archetype). Each characteristic has a cumulative cap: 2 by the end of the first archetype, 4 by the end of the second, 6 by the end of the Exemplar.
- **Consequences:** Removing a granting talent or an earlier increase can cascade-null later increases.

## 010. Availability conditions are stored on the increase entry

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** The data for decision 009 needed a home. It could be stored on each source (origin, homeworld, archetype, talent), or on each option.
- **Decision:** Each characteristic and skill entry has separate fields: `availableForOrigins`, `availableForHomeworlds`, `availableForArchetypes` and `availableForTalents`. Skill increases follow the same rules and the same 2 / 4 / 6 cap as characteristic increases, using their own table. The 6 starting characteristic increases can be any characteristic, at most twice each, and do not count toward the cap.
- **Consequences:** All conditions for one option are in one place, as flat, readable fields. Origins, homeworlds, archetypes and talents don't need to know which increases they unlock.

## 011. Talent and ability availability comes from lists granted by sources

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Talents and abilities are offered in named groups (common talents, Soldier talents, …) that sources unlock. Many talents appear in several groups, so storing every source on each talent (as decision 010 does for increases) would repeat the same group data on many entries.
- **Decision:** Talents and abilities each have one table and a set of lists. A list is a named array of IDs and holds no rules. The `common` list is always available. Origins, homeworlds and talents grant lists that apply to every slot (a talent's lists apply only after it is taken). Each archetype has one archetype list, which applies only to its own archetype talent/ability slots, never to common slots. The slot's pool is the union of applicable lists. Lists are not encoded, so their keys are strings.
- **Consequences:** Talents and abilities use the opposite storage direction from increases (decision 010): sources point to lists, rather than entries pointing to sources. Editing lists needs no version bump, but can null choices in old links.

## 012. Talent requirements are stored on the talent, and unmet ones are shown in red

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Talents have prerequisites (level, other talents, either-or talents, characteristic values). The user should see talents they can't take yet, not have them silently hidden.
- **Decision:** Each talent and ability entry has `requirements: Requirement[]` (AND), with an `anyOf` kind for OR. They are evaluated against the state just before the slot. The availability function returns the whole pool with a `selectable` flag and the unmet requirements. The UI shows unselectable entries in red and doesn't let the user pick them. The validator treats only selectable entries as legal. A talent already taken is not selectable again.
- **Consequences:** Extends decision 008: the UI shows the pool, but still lets the user pick exactly the set the validator accepts, so the two can't drift apart. Requirements on earlier talents cascade-null through the existing chronological pass.

## 013. Talent and ability clarifications

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Open questions left by decisions 011 and 012.
- **Decision:** An archetype list applies only to its own archetype's slots: first-archetype lists to `firstArchetype*` slots, second to `secondArchetype*`, Exemplar to `exemplarArchetype*`. There are no common abilities, so the `common` list and common slots exist for talents only. Talents and abilities can each be taken at most once per build. Characteristic values used by requirements are not stored in the build. They are calculated from the replayed character state. Requirements are checked only during the level 1–55 replay, against the state before the slot, and never against the finished build.
- **Consequences:** Clarifies 011 and 012 without superseding them. The ability pool is the owning archetype's ability list plus ability lists granted by the origin, homeworld and earlier talents.

## 014. Characteristic value formula

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** The `characteristic` requirement (decision 012) needs a value, which decision 013 says is calculated, not stored.
- **Decision:** Every characteristic starts at 30. Homeworlds, origins and talents add fixed modifiers, stored on their entries as `characteristicModifiers`. Each starting increase and each `characteristicIncrease` slot adds `INCREASE_AMOUNT`. Talent modifiers and slot increases count only for slots after them in the replay.
- **Consequences:** Nulling a talent or an increase lowers later values, which can cascade-null talents with characteristic requirements in the same single pass.

## 015. Characteristic increases add 5

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Decision 014 left the amount added per increase (`INCREASE_AMOUNT`) undefined.
- **Decision:** Each of the 6 starting increases and each `characteristicIncrease` slot always adds 5. Homeworld, origin and talent modifiers vary per entry and are stored as data.
- **Consequences:** Supplements 014. The fixed amount is a constant in code, not data.

## 016. Keystone features don't affect the character state

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** The replay needed to know what keystone features add to the character state.
- **Decision:** Keystone features are the fixed entries in an archetype's schema. They are not choices, they are never encoded or validated, and they add nothing to the character state. The replay skips them.
- **Consequences:** No talent, ability, increase or requirement can depend on a keystone feature.

## 017. Ultimate upgrades and confirmed skill list

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Upgrade slots had no availability rule, and the skill list was unconfirmed.
- **Decision:** `*Upgrade` slots (such as `firearmMasteryUpgrade`) choose an ultimate upgrade. Each ultimate has its own table of exactly 4 upgrades, encoded in 3 bits (4 options + null). All 4 are always available, and upgrades don't change the character state. The 13-skill list and its ID order are confirmed as final.
- **Consequences:** Every ultimate upgrade slot has the same fixed width. The skill table IDs are now part of the URL contract.

## 018. Each ultimate upgrade can be picked only once

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** A schema can have the same upgrade slot more than once (for example `firearmMasteryUpgrade` at levels 9 and 15).
- **Decision:** Each upgrade can be picked at most once per build. The character state tracks `upgradesTaken`, keyed by ultimate and ID. An upgrade slot offers the ultimate's 4 upgrades minus those already taken. This replaces the part of decision 017 that said all 4 are always available and upgrades don't change the state.
- **Consequences:** A repeated upgrade in a link is nulled. Clearing an earlier upgrade can make it legal again in a later slot, but it doesn't bring back a choice that was already nulled.

## 019. Two screens, with talent options grouped by source list

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** The UI concepts in `design/` define the screens, and the talent picker shows each list as a separate group.
- **Decision:** The app has two screens: the archetype pick screen (three rows: first, second, Exemplar) and the level-up screen (radial progression, option list, detail panel). Talent and ability options are grouped by the list they come from. `talentOptions` returns each option's `lists` so the UI can group without re-deriving the pool. A talent in several pool lists appears in each group. Described in [UI Design](./ui-design.md).
- **Consequences:** Grouping is presentation only. The validator still uses only `available(state, slot)`.

## 020. Character creation lives on the archetype pick screen

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** The updated `design/archetype-selection.png` puts the static choices and the starting characteristic increases above the archetype rows. The Vision described them on a separate set of dropdowns, which also included the first archetype.
- **Decision:** The archetype pick screen also holds four dropdowns for homeworld, origin, triumph and darkest hour, and one cell per characteristic, with two pips for the 6 starting increases. The first archetype is picked from its row, not from a dropdown. The app still has two screens. This extends decision 019.
- **Consequences:** Presentation only. The `BuildPlan`, the URL format and the validation rules are unchanged.

## 021. Playwright for end-to-end tests and agent browser access

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Unit tests (Vitest) can't show that the screens work in a real browser, and coding agents need a way to open and inspect the running app.
- **Decision:** `@playwright/test` runs end-to-end tests from `e2e/` against the Vite dev server, in Chromium (`npm run test:e2e`). `@playwright/mcp` is a dev dependency, registered as the `playwright` server in `.mcp.json`, so agents use the version pinned in the lockfile.
- **Consequences:** Vitest must not pick up `e2e/*.spec.ts` once it is added. Running the e2e tests needs a one-time `npx playwright install chromium`.

## 022. Codec details: choice arrays, injected schemas, unknown archetypes

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Implementing the codec in `src/codec` raised questions the earlier entries left open: what the `*ChoicesIds` arrays hold, where the codec gets its schemas, and how to decode a link with an archetype ID that has no schema.
- **Decision:** Each `*ChoicesIds` array has one entry per choice slot of its schema, in encoding order. Keystone features have no entry, and an unselected archetype has an empty array. The first field written takes the most significant bits, and the encoder drops trailing all-zero characters. The codec holds no game data: the archetype schemas are passed in as an argument. The encoder throws on a malformed build. The decoder throws `DecodeError` only for text that isn't base64url or has an unsupported version, and returns everything else unvalidated. The one exception is an archetype ID with no schema: the decoder stops there, returns that archetype and everything after it as empty, and logs a warning.
- **Consequences:** The UI and validator map slots to choices through `choiceSlots(schema)`, and read keystone features from the schema. The codec can be tested with fixture schemas before the real data exists. A link with an unknown archetype loses everything after that ID, because those bits can't be interpreted.

## 023. Game data tables in `src/gamedata`

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** The codec and the coming validator need real tables: homeworlds, origins, triumphs, darkest hours, and first and second archetypes with their schemas. Where the "allowed second archetypes" rule lives was not defined.
- **Decision:** Each table is a `readonly` array of entries with an explicit `id`, in its own file under `src/gamedata`. Homeworlds and origins share one shape: `characteristicModifiers`, `grantsTalentLists` and `grantsAbilityLists`. Triumphs and darkest hours hold only `id` and `name`. An archetype entry holds its `schema`, `archetypeTalentList` and `archetypeAbilityList`. A first archetype also lists `allowedSecondArchetypeIds`. A data test checks that IDs are unique and fit their field, that each schema covers exactly its level range (1–15 or 16–35), and that every allowed second archetype exists.
- **Consequences:** Which second archetypes are allowed is stored on the first archetype, so second archetypes don't need to know about first ones. Characteristic IDs and the talent and ability lists are referenced but not defined yet, so the example entries have no modifiers, and their list keys point to lists that don't exist yet.

## 024. Characteristics table and its ID order

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Homeworld, origin and talent `characteristicModifiers` reference characteristic IDs, and so do starting increases and `characteristicIncrease` slots. No table defined them, so data entries had to use bare numbers.
- **Decision:** `src/gamedata/characteristics.ts` defines the 9 characteristics with IDs in this order: WS = 1, BS = 2, STR = 3, TGH = 4, AGI = 5, INT = 6, PER = 7, WP = 8, FEL = 9. Each entry has `id`, `abbreviation` and `name`. Data refers to them through the `CHARACTERISTIC` constants, such as `CHARACTERISTIC.BS`, never by bare number. Data list keys are camelCase, and entry names are Title Case.
- **Consequences:** The characteristic ID order is part of the URL contract, as decision 017 made the skill order. A data test checks that every modifier references an existing characteristic.

## 025. A null character means the Rogue Trader

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Decision 003 reserves `0` for null in every field. For `characterId`, an unset character needed a meaning, and the Rogue Trader needed an ID.
- **Decision:** A null `characterId` (encoded `0`) means the Rogue Trader, the main character and the default. The Rogue Trader has no entry in the characters table. That table holds only the companions, starting at ID 1.
- **Consequences:** Every build has a character, so the validator and UI never handle a missing one. The first version never writes a character ID, so its links stay short and an empty build is still just the version. When companions are added, existing links still decode as Rogue Trader builds. Supplements 003 without superseding it: `0` still means null, and null has a fixed meaning for this field.

## 026. `characterId` takes 5 bits

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** With decision 025, the characters table holds the companions. 4 bits (15 entries) leaves too little room for them.
- **Decision:** `characterId` is encoded in 5 bits, so the table can hold up to 31 companions. The format version stays at 1: the app has not been released, so no links in the old layout exist.
- **Consequences:** Every link is one bit longer, and every field after `characterId` moves by one bit. An empty build still encodes to `E`. From the first release on, a width change like this must bump the format version (§4.1 of Architecture).

## 027. `originId` takes 5 bits

- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** The origins table already has 11 entries, close to the 15 that 4 bits allow.
- **Decision:** `originId` is encoded in 5 bits, so the table can hold up to 31 origins. As in decision 026, the format version stays at 1, because the app has not been released.
- **Consequences:** Every link is one more bit longer, and every field after `originId` moves by one bit. An empty build still encodes to `E`.
