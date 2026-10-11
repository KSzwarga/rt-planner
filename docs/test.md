# Testing

How RT Planner is tested. The code under test is described in [Architecture](./Architecture.md), [Availability Rules](./availability-rules.md) and [UI Design](./ui-design.md).

## Layers

| Layer   | Scope                                   | Runner     | Location                      | Runs in  |
| ------- | --------------------------------------- | ---------- | ----------------------------- | -------- |
| Unit    | One function or method                  | Vitest     | `src/**/*.test.ts`            | Node     |
| Service | Several modules working together        | Vitest     | `src/**/*.service.test.ts`    | Node     |
| E2E     | UI components and whole user workflows  | Playwright | `e2e/*.spec.ts`               | Chromium |

Each layer tests what the layer below it can't. Unit tests pin down the details, service tests prove that the parts fit together, and e2e tests prove that the user can actually do it in a browser.

## Unit tests

A unit test covers **one function or method** on its own, with hand-built inputs.

Examples:

- When creating unit tests remember to only test actual business logic of this app. Don't test imported or standard libraries and dont create tests that don't provide actual value.
- `BitWriter` / `BitReader`: writing and reading a single field of a given width, and reading past the end of the stream returns null.
- base64url conversion: a value round-trips, and only the last character is padded.
- one availability function, such as `characteristicIncrease`: given a `CharacterState` just before the slot, it offers exactly the right characteristics, and respects the cap.
- characteristic value calculation: start at 30, plus modifiers, plus 5 per increase.

Guidelines:

- Build the input directly, such as a `CharacterState`, instead of producing it by running other code. That way a failing unit test points at one function.
- Cover edge cases here: null everywhere, maximum IDs, caps reached, requirements just met or just missed.
- Place the test next to the code it tests: `availability/characteristicIncrease.ts` → `availability/characteristicIncrease.test.ts`.

## Service tests

A service test covers **a larger integrated part** of the app, running several modules together through their public entry point, with no mocks between them.

The main example is the **codec**: `BuildPlan` → `BitWriter` → base64url → URL, and back through the `BitReader`, the schemas and the validator.

- Encoding then decoding a build gives back the same build, for complete and partial builds ([Architecture §5](./Architecture.md#5-nulls-and-incomplete-builds)).
- Known URLs decode to known builds. These fixed links guard the URL format, which is a public contract: if one breaks, the format changed and needs a version bump ([decision 004](./decisions.md#004-format-version-prefix)).
- A link with illegal choices decodes with exactly those choices nulled, including cascades.

Another example is the **validator**: a whole `BuildPlan` goes in, and the chronological replay ([Architecture §6](./Architecture.md#chronological-check)) uses the real schemas and availability functions.

- Removing a talent cascade-nulls the choices that depended on it, in a single pass.
- Running the validator on its own output changes nothing.
- The second archetype and the Exemplar are kept or nulled according to [decision 007](./decisions.md#007-archetype-nulling-rules).

Guidelines:

- Test through the public entry point, such as `encode`, `decode` or `validate`, not internal helpers.
- Use real tables and schemas, or small fixture tables that have the same shape.
- Name the file after the service: `codec.service.test.ts`, `validator.service.test.ts`.

## E2E tests

An e2e test drives the **real app in a browser** with Playwright. It covers UI components and whole user workflows, from a click to the URL and back.

Examples:

- **Archetype pick screen**: picking a first archetype unlocks the allowed second archetypes, locked archetypes are red and can't be picked, and the starting characteristic pips stop at 2.
- **Level-up screen**: clicking a node shows its options, talent options are grouped by list, and unselectable talents are red and show their requirements.
- **Workflows**: build a character from scratch, copy the URL, open it in a new page, and get the same build. Open a link with illegal choices and see them empty.

Guidelines:

- Test what the user sees and does. Use role- and text-based locators, such as `getByRole` or `getByText`, not CSS classes.
- Don't re-test every rule here. Unit and service tests cover the rule details, so e2e tests only need to show that the UI is wired to them.
- `playwright.config.ts` starts the Vite dev server (`npm run dev`, port 5173). Locally, it reuses a server that is already running. On CI, it always starts a fresh one and retries failed tests twice.

### Playwright MCP

`@playwright/mcp` is a dev dependency, registered in `.mcp.json` as the `playwright` server. It lets coding agents open the running app, click through it and read the page, so they can check a UI change before or alongside writing an e2e test. It ships its own build of Playwright, which can differ from the one `@playwright/test` uses.

## Running the tests

| Command               | Runs                                     |
| --------------------- | ---------------------------------------- |
| `npm test`            | Unit and service tests, once             |
| `npm run test:watch`  | Unit and service tests, in watch mode    |
| `npm run test:e2e`    | E2E tests                                |
| `npm run test:e2e:ui` | E2E tests, in Playwright's interactive UI |

Browsers are not installed by npm. Each machine needs `npx playwright install chromium` once before running the e2e tests.

The runners never pick up each other's files. Vitest's `include` in `vite.config.ts` is limited to `src/`, and Playwright's `testDir` is `e2e/`.
