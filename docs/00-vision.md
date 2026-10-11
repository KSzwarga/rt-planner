# Vision

RT Planner is a character builder for **Warhammer 40,000: Rogue Trader**. It lets players plan a character's progression ahead of time and share the result as a link.

For technical details, see [Architecture](./Architecture.md).

Architectural decisions are logged in [Decisions](./decisions.md). That log is **append-only**: add new entries, and never edit or delete earlier ones.

## First version

The first version supports only one character: **the Rogue Trader** (the main character). Companions are out of scope for now. The Rogue Trader is the default: a build with no character chosen is a Rogue Trader build.

### Character creation screen

The first screen is the archetype pick screen. It lets the player pick these with dropdowns:

- Homeworld
- Origin
- Triumph
- Darkest Hour

On the same screen, the player also picks the 6 starting characteristic increases and the archetypes. Each archetype tier has its own row. See [UI Design](./ui-design.md#archetype-pick-screen).

Archetypes unlock in order:

1. **First archetype**: picked from the first-archetype list.
2. **Second archetype**: can be changed only once a first archetype is selected, and only to one that the chosen first archetype allows.
   - A shared link can open with a second archetype already selected and no first. It stays and is shown, but it is locked until a first archetype is picked.
   - Picking a first archetype that doesn't allow the current second archetype clears the second archetype and its choices.
3. **Exemplar**: can be selected only once a second archetype is selected. It is available to every archetype.
   - Once present (selected, or loaded from a link), it is never cleared automatically, even if the second archetype is later removed. Illegal choices inside it are still cleared.

### Level progression screen

Selecting an archetype opens a separate screen showing that archetype's level progression. There the player fills in the choices for each level: talents, abilities, skill and characteristic increases, and so on.

The progression is laid out as a **radial menu**. See [UI Design](./ui-design.md) for details.
