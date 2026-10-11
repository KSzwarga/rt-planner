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

## 028. Unit and service tests live in `test/`

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Unit and service tests sat next to the code they test in `src/`, mixing test files into the app source tree.
- **Decision:** Vitest tests live in a top-level `test/` folder that mirrors `src/`, such as `src/codec/bits.ts` → `test/codec/bits.test.ts`. Vitest's `include` is `test/**/*.test.{ts,tsx}`, and `tsconfig.app.json` includes `test/` so the tests are still type-checked. E2E tests stay in `e2e/`.
- **Consequences:** `src/` holds only app code. Tests import the code under test through `../../src/...` paths, and moving a module means moving its test to the matching path under `test/`.

## 029. Imperial World is one homeworld entry per characteristic

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** The Imperial World homeworld gives +10 to one characteristic of the player's choice, any except WS and BS. A `BackgroundEntry` has fixed `characteristicModifiers`, and `BuildPlan` has no field for this choice.
- **Decision:** The homeworlds table has one entry per choice, named `Imperial World: <abbreviation>` (STR, TGH, AGI, INT, PER, WP, FEL), each with a +10 modifier to that characteristic. All of them grant the same `imperialWorld` talent list. They take IDs 5–11, and Voidborn moves to ID 12. As in decision 026, the format version stays at 1, because the app has not been released.
- **Consequences:** The choice is encoded in `homeworldId`, so the `BuildPlan` shape, codec and validator don't change. The table has 12 entries, which still fits the 4-bit field (up to 15). The homeworld dropdown shows 7 Imperial World options instead of 1.

## 030. Forge World is one homeworld entry per augmentation

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** The Forge World homeworld makes the player choose one of three augmentations: Subskin Armor, Locomotion System or Analytic System. As with Imperial World (decision 029), `BuildPlan` has no field for this choice.
- **Decision:** Following decision 029, the homeworlds table has one entry per option, named `Forge World: <option>`. The three entries are identical apart from the name, with the same characteristic modifiers and the same `forgeWorld` talent list. Forge World takes IDs 2–4, so the later homeworlds move: Fortress World 5, Hive World 6, Imperial World 7–13, Voidborn 14. This replaces the IDs given in decision 029. The format version stays at 1, because the app has not been released.
- **Consequences:** The table has 14 entries, so the 4-bit `homeworldId` field (up to 15) has room for one more. Another homeworld choice or new homeworld will likely need a 5-bit field, as decisions 026 and 027 did for characters and origins.

## 031. Grouped table entries show as nested dropdowns

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Decisions 029 and 030 split homeworlds with a choice into one entry per option, and the origins table already does the same for Sanctioned Psyker and Arbitrator. Listed flat, these options crowd the dropdowns (7 Imperial World entries in a row).
- **Decision:** A table entry named `Group: Option` belongs to the group before the `: `. The dropdown shows each group once, at the position of its first entry, and its options in a nested menu labelled by the part after `: `. The grouping is derived from the names by `toMenuItems` in `src/ui/menuItems.ts`, and the tables get no extra field. The dropdown is a custom ARIA menu (`NestedSelect`), because a native `<select>` can't nest.
- **Consequences:** Any table can use nested options by following the naming convention, with no data or code changes. The separator `: ` must not appear in a name that isn't meant to be grouped. The grouping is presentation only, so the URL format and `BuildPlan` don't change.

## 032. The origin decides the available triumphs and darkest hours

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Which triumphs and darkest hours a character can take depends on their origin. Decision 023 gave triumphs and darkest hours only an `id` and a `name`, and no rule said where this dependency lives. No validator existed yet to enforce it.
- **Decision:** Each origin entry lists `availableTriumphIds` and `availableDarkestHourIds`, so the rule lives on the origin, as allowed second archetypes live on the first archetype (decision 023). Following decision 008, one availability function per field (`src/availability/originChoices.ts`) is shared by the UI and the validator. Without an origin, nothing is available: unlike the second archetype (decision 007), a triumph or darkest hour without an origin is nulled. The first version of the validator (`src/validation/validator.ts`) checks the static choices: unknown homeworld, origin, triumph and darkest hour IDs, and these origin lists. The archetype pick screen runs it on every edit.
- **Consequences:** Triumphs and darkest hours don't need to know about origins. A link with a triumph but no origin loses the triumph. Changing the origin nulls any triumph or darkest hour it doesn't list. The lists are availability data, so changing them needs no format version bump (Architecture §4.1). Until the real lists are known, every origin lists triumph 1 and darkest hour 1, the only entries in those tables.

## 033. Triumphs and darkest hours don't depend on the origin

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Decision 032 assumed each origin allows its own triumphs and darkest hours. The game data shows every origin offers the same three triumphs (Apex of Brilliance, Illustrious Glory, Feat of Greatness) and the same three darkest hours (Grim Portents, Brand of Shame, Shadow of Torment).
- **Decision:** Supersedes 032. Origins no longer list `availableTriumphIds` or `availableDarkestHourIds`, and the `originChoices` availability functions are removed. Every triumph and darkest hour is always available, with or without an origin. The triumph and darkest hour tables hold these three entries each, with IDs 1–3 in that order. The validator from 032 stays, checking only that homeworld, origin, triumph and darkest hour IDs exist in their tables.
- **Consequences:** The triumph and darkest hour dropdowns are always enabled and show their whole table. Changing the origin never clears them. The triumph and darkest hour IDs are part of the URL format, so their order is now fixed.

## 034. Starting increase cells cycle on click

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** UI Design gives each characteristic a cell with two pips for the 6 starting increases, but didn't say how the user adds or removes them. The pips alone are too small to tap reliably on a phone.
- **Decision:** The whole cell is one button that cycles its characteristic 0 → 1 → 2 → 0 increases. When it can't take another (all 6 slots used), a click removes all of its increases. Cells with no increase are disabled while all 6 are used. The UI stores taken increases first, in the order taken, with free slots last. The rule itself, at most 2 per characteristic, is the availability function `availableStartingIncreaseIds`, shared with the validator (decision 008).
- **Consequences:** One control per characteristic works the same with a mouse, a keyboard or touch. Lowering a count from 2 to 1 takes two clicks (to 0, then to 1). Free slots at the end are trimmed from the URL by the encoder, so builds with fewer than 6 increases get shorter links. The validator doesn't reorder slots, so a link with gaps keeps them until the user edits the increases.

## 035. Upgrade slot kinds are listed by name

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Upgrade slot kinds were matched by a pattern (any kind ending in `Upgrade`) and given their 3 bits by a separate branch, apart from the table that held every other kind's bit width. A misspelt upgrade kind in a schema still type-checked and encoded.
- **Decision:** Each ultimate's upgrade slot kind is named in `UpgradeSlotKind` (`firearmMasteryUpgrade`, `cullTheWeakUpgrade`), and its bit width sits in the one bit-width table, `CHOICE_SLOT_KIND_BITS` (renamed from `FIXED_SLOT_KIND_BITS`, as every choice kind now has a fixed name). Adding an ultimate means adding its kind to both.
- **Consequences:** Every choice slot kind and its width are in one place, and a schema with an unknown or misspelt choice kind fails to type-check. Adding an ultimate takes one more line than before. The widths and the URL format don't change.

## 036. One `keystoneFeature` slot kind and a keystone feature table

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Each keystone feature was its own slot kind, named by a pattern (`runAndGunKeystoneFeature`, `firearmMasteryUltimateKeystoneFeature`). The slot kind and the feature it showed were mixed up in one string, and the "shared keystone-feature table" in Architecture §4.3 didn't exist.
- **Decision:** There is one slot kind, `keystoneFeature`. A schema slot for it is an object, `{ kind: 'keystoneFeature', featureKey }`, built in data with `keystoneFeature('runAndGun')`. Choice slots stay plain kind strings. `KEYSTONE_FEATURES` in `src/gamedata/keystoneFeatures.ts` holds every keystone feature by key, with its name and `isUltimate`. Keystone features are never encoded, so they use string keys, as talent lists do (decision 011), not numeric IDs.
- **Consequences:** Adding a keystone feature means adding one table entry, with no new slot kind. A misspelt key fails to type-check, and a data test checks that every schema's keystone features exist. The level-up screen can read a feature's name from the table. The table can change freely, with no format version bump, and the encoding doesn't change.

## 037. The build lives in the URL fragment, replaced on every edit

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Decision 001 keeps the build in the URL, but didn't say which part of it, or how edits affect the browser history. The codec and the validator for the static choices were ready to connect to the page.
- **Decision:** The encoded build is the URL fragment (`#…`). Each edit validates the build and replaces the URL with `history.replaceState`, so edits add no history entries. The app reads the fragment on load and on `hashchange`, validates it, and rewrites it if anything was nulled. An empty build has no fragment. An unreadable fragment opens an empty planner and logs a warning. The URL is written only by an edit or by reading a link, never as a side effect of rendering. Until the Exemplar schema exists, the codec gets an empty one. Links are not stable before the first release: table IDs can still change, so an early link may open as a different build.
- **Consequences:** Fragments are never sent to the server, so any static host works, and pasting a link into an open tab loads it without a reload. Back leaves the planner instead of undoing edits, so there is no undo history yet. The validator doesn't check archetypes yet, so a hand-edited link can still carry archetype choices that aren't checked. They aren't shown anywhere yet.

## 038. Selecting an archetype resets its choices

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** The archetype rows let the user pick archetypes before the level-up screen exists. A `*ChoicesIds` array must have one entry per choice slot of its archetype's schema (§3), or the encoder throws, so changing the archetype has to change the array too.
- **Decision:** Selecting a first or second archetype, or taking the Exemplar, sets its choices to one null per choice slot (`emptyChoices`). Switching to another archetype in the same row discards the old one's choices, and clicking the selected archetype clears it with them. Re-selecting the selected archetype keeps its choices. The validator now also checks the archetypes themselves, following decision 007. Unknown first and second archetypes are nulled, and so is a second archetype that a non-null first doesn't allow. A nulled archetype loses its choices, and the Exemplar is never nulled. Selecting an archetype doesn't open the level-up screen yet.
- **Consequences:** A build always has choices arrays that match its schemas, so it can always be encoded. Switching archetype loses that archetype's progression, so the level-up screen should warn about this once it exists. The choices inside an archetype are still not validated.

## 039. The seven second archetypes, and which first archetypes allow them

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Only Executioner existed as a second archetype, and its schema was a placeholder that didn't match the game. Its ultimate was at level 20, with upgrades at 24, 30 and 35. The first archetypes' allowed second archetypes were mostly empty.
- **Decision:** The second archetype table holds Assassin, Vanguard, Bounty Hunter, Master Tactician, Grand Strategist, Arch-Militant and Executioner, with IDs 1–7 in that order. Executioner moves from ID 1 to 7, which is allowed because links aren't stable yet (decision 037). The schemas follow the Rogue Trader fandom wiki: the keystone at 16, the ultimate at 19, and upgrades at 27 and 35. Level 20's additional AP is a fixed benefit, so it is the keystone feature `additionalActionPoint`. Where an archetype's Heroic Act and Desperate Measures ultimates have different names, its keystone feature names both, and the upgrade slot kind takes the Heroic Act name, such as `steadySuperiorityUpgrade`. Which first archetypes allow each second archetype follows the list from the project owner, which includes the Bladedancer and Executioner pairings the wiki pages lack. First archetypes reference second archetypes through the `SECOND_ARCHETYPE` ID constants, as data references characteristics through `CHARACTERISTIC` (decision 024). The placeholder Executioner's keystone features (Killing Edge, Cull the Weak) and `cullTheWeakUpgrade` are removed.
- **Consequences:** Every first archetype now has 3–4 second archetypes to choose from. Soldier no longer allows Executioner. The second archetype row shows 7 archetypes, so it uses tighter spacing (as in the mock-up) to fit on one line on desktop.

## 040. Confirm archetype switches that would undo choices

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Switching archetype discards the old archetype's choices (decision 038), and a new first archetype can make the validator null the second. One click could silently lose a progression.
- **Decision:** Before applying an archetype change, the UI asks "Switching archetype might undo some of your previous choices, do you want to proceed?" when the change would: switch or clear a first archetype that has non-null choices, switch or clear a second archetype that has non-null choices, or switch the first archetype to one that doesn't allow the selected second. `undoesEarlierChoices` decides this before the change, using the shared availability function, so it matches what the validator would do. The dialog is the native `<dialog>` element opened with `showModal()`. Cancel has focus first, and Escape cancels.
- **Consequences:** Nothing is lost without confirmation, and switches that lose nothing don't interrupt. Clearing the first archetype doesn't ask unless it has choices, because the second archetype is kept (decision 007). Toggling the Exemplar off discards its choices without asking. The Exemplar has no schema yet, so it has no choices to lose, but this should be revisited once it does.

## 041. Talent table and lists from the wiki, and talents take 10 bits

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Talent slots and the talent lists that origins, homeworlds and archetypes grant had no data behind them. The wiki's talents table lists each talent's name, effect and source.
- **Decision:** `talents.ts` and `talentLists.ts` in `src/gamedata` are generated from the [wiki's talents table](https://roguetrader.wiki.fextralife.com/Talents). Each talent is stored once, with `id`, `name` and `description`. IDs follow alphabetical order, and new talents are appended. A talent's source decides its list: All Archetypes goes to `common`, Psyker and Sanctioned Psyker to their own lists, each psyker discipline to its own list, and each archetype, origin or homeworld to its existing list. Sources outside the planner's scope are left out: Overseer, colony traits and projects, convictions, companion-only talents, Navigator, Unsanctioned Psyker and one-off events. When the wiki repeats a talent with different text, the most complete description is kept. That leaves 546 talents, more than 9 bits can hold, so `*Talent` slots take 10 bits (up to 1023). The format version stays at 1, because links aren't stable yet (decision 037).
- **Consequences:** Every list a homeworld, origin or archetype grants now exists, and data tests check this, along with every talent being in a list. Every link with talent choices is one bit longer per talent slot. Requirements, granted lists and characteristic modifiers on talents are still missing, so every talent in a slot's pool is selectable for now. Some wiki descriptions have gaps where the wiki itself is incomplete, such as "gains +1 and +10 damage".

## 042. Increase availability per archetype tier, and talent requirements

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Decision 010 stores which archetypes can improve a characteristic or skill as `availableForArchetypes` on its entry. But first and second archetypes are separate tables with overlapping IDs (1 is Soldier in one and Assassin in the other), so one list of IDs is ambiguous. Talent requirements had a type in Availability Rules but no data, and the talent table is generated from the wiki.
- **Decision:** Increase entries have `availableForFirstArchetypes` and `availableForSecondArchetypes` in place of `availableForArchetypes`. This refines decision 010 without superseding it: the conditions still live on the increase entry. The Exemplar can improve every characteristic and skill, as the wiki states, so that is part of the availability rule, not data. The data comes from each archetype's page on the Rogue Trader fandom wiki. A data test restates the wiki's lists per archetype to check them. A skills table (`SKILLS`, `SKILL` constants) holds the 13 skills in the order decision 017 fixed. First archetypes get `FIRST_ARCHETYPE` ID constants, like `SECOND_ARCHETYPE`. Talent requirements live in a hand-written file, `talentRequirements.ts`, keyed by talent ID and written by talent name, apart from the generated talent table. Names resolve when the module loads and throw if unknown. The first requirements: Heavy Armour Proficiency needs STR 45, and each Advanced Skill talent needs its Base Skill talent.
- **Consequences:** Availability can be checked per slot owner without ambiguity. The talent table can be regenerated without losing requirements. Origins, homeworlds and talents that unlock characteristics or skills still have no data, so no archetype offers Lore (Warp) yet. Nothing uses requirements or increase availability yet: the talent and increase availability functions come with the level-up screen.

## 043. The validator replays every archetype choice, and origins unlock increases

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** The validator checked the static choices and the archetypes, but not the choices inside them. So a change that made a later choice illegal, such as switching to an origin that doesn't unlock a chosen skill, left that choice in place. Origins' "on advancement" characteristics and skills had no data.
- **Decision:** The validator now runs the chronological replay of Architecture §6. `initialState` builds the character state from the static choices: characteristics at 30, plus homeworld and origin modifiers and the starting increases, and the origin's and homeworld's talent lists. `replayChoices` then walks every archetype choice in level order, checks it with its slot kind's availability function, and either applies it or nulls and logs it. That covers increases (source and the 2 / 4 / 6 cap), talents (pool, requirements, no repeats) and upgrades (1–4, each once). Abilities have no table yet, so only no-repeats is checked. The availability functions live in `src/availability`, ready for the level-up screen. Increase entries gain `availableForOrigins`, from the wiki's per-origin "On advancement this Origin makes available" lines, and `availableForHomeworlds`, which is empty for now. `ORIGIN` ID constants live in `originIds.ts`, apart from `origins.ts`, to avoid an import cycle. The Exemplar's empty schema and its talent list moved to `src/gamedata/exemplar.ts`.
- **Consequences:** Every edit and every link is fully checked. Cascades, such as removing a Base Skill talent nulling its Advanced Skill, happen in one pass. Changing the origin or homeworld can now null archetype choices, but unlike archetype switches (decision 040), it doesn't ask for confirmation. Talents don't yet grant lists or characteristic modifiers, so the replay doesn't apply them.

## 044. Ability table and lists from the wiki, and talents that were abilities

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Ability slots had no table, so the validator could only check that an ability wasn't taken twice (decision 043). The wiki's talents table also lists some abilities as talents.
- **Decision:** `abilities.ts` and `abilityLists.ts` in `src/gamedata` are generated from the wiki's abilities table, the same way as talents (decision 041): IDs in alphabetical order, and one list per archetype, per origin that has abilities, and per psyker discipline, keyed like the talent lists. There is no common list. Left out: keystone abilities, matched by name against the fandom pages' Keystone lists and `KEYSTONE_FEATURES`, Heroic Act and Desperate Measures ultimates, and sources outside scope (Overseer, Navigator, Tech-Priest). Origins grant their ability list through `grantsAbilityLists`. Six talents that are the same ability under the same name and effect were removed from the talent table: Assault Onslaught, Forced Repentance, In the Name of the Lex Imperialis!, That's an Order!, War Hymn and Where It Hurts. Three talents that share a name with an ability but have a different effect and source were kept: Defensive Stance, Perfect Timing and Strongpoint. Ability slots offer the owning archetype's list plus the build's lists. Exemplar ability slots offer both archetypes' lists. The validator checks the pool and no-repeats.
- **Consequences:** Ability choices are fully validated, and switching origin nulls abilities that only the old origin offered. The talent table shrinks from 546 to 540, so talent IDs after the removed ones move. Links aren't stable yet (decision 037), so this is allowed. A data test fails if a talent shares a name with an ability beyond the three known cases.

## 045. The level-up screen, and archetypes open it instead of toggling

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** The level-up screen was the next step. Clicking a selected archetype cleared it, which left no click to open it again.
- **Decision:** Clicking an archetype selects it and opens its level-up screen, after the confirmation of decision 040 when needed. Clicking the selected archetype or the Exemplar only opens it, so archetypes are no longer cleared by a click. The screen has the ring, the option list and the detail panel of UI Design. Every slot can be filled in any order. Each slot's options come from `choiceSlotView`, which evaluates the shared availability functions against `stateBeforeSlot`, the state built from earlier choices only. Every pick goes through the validator, so later choices that stop holding are nulled. Talents can now unlock things for later slots: `talentGrants.ts` (talent and ability lists) and `availableForTalents` on characteristics and skills, both empty for now. A level's slots share an angle, on up to three rings, since Bounty Hunter's level 20 has three slots. Which screen is open is kept in memory, not in the URL.
- **Consequences:** The UI and the validator can't disagree about a slot. Adding talent grants later needs only data. A reload returns to the archetype pick screen. Without a schema, the Exemplar's level-up screen has nothing to show yet.

## 046. Short labels are data: an `abbreviation` on every shown entry

- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** The level-up screen needs short labels for nodes and option icons. Deriving them from names in code needs a different rule per table, and names that start alike collide: Operative and Officer were both "O".
- **Decision:** Every table the UI shows with a short label has an `abbreviation` field (`AbbreviatedEntry`): characteristics, skills, talents, abilities, archetypes, keystone features, the Exemplar (`EXEMPLAR`) and a new upgrade table (`UPGRADES`, U1–U4). No code derives a short label. Talents and abilities get a starting abbreviation (their initials) when the generator writes the data file, and it can be edited there. The others are written by hand. A data test checks that every abbreviation has 1 to 4 characters. Upgrade slots validate against `UPGRADES`, like every other slot kind against its table.
- **Consequences:** The UI reads `entry.abbreviation` the same way for every kind, through one table lookup per slot kind (`optionTable`). Archetype emblems show their abbreviation (SOL, OPR, OFF…).
