import { availableSecondArchetypeIds } from '../availability/archetypes'
import type { ArchetypeSchemas } from '../codec/codec'
import { FIRST_ARCHETYPES } from '../gamedata/firstArchetypes'
import type { FirstArchetypeEntry } from '../gamedata/types'
import type { BuildPlan, Choice, Id } from '../model/buildPlan'
import { emptyChoices, type Schema } from '../model/schema'
import { ARCHETYPE_SCHEMAS } from '../url/buildUrl'

/**
 * The change that selects a first archetype, or clears it with null. A newly selected archetype
 * starts with every choice empty, so its choices array always matches its schema.
 */
export function selectFirstArchetype(
  build: BuildPlan,
  id: Id | null,
  schemas: ArchetypeSchemas = ARCHETYPE_SCHEMAS,
): Partial<BuildPlan> {
  if (id === build.firstArchetypeId) return {}
  return { firstArchetypeId: id, firstArchetypeChoicesIds: choicesFor(id, schemas.first) }
}

/** The change that selects a second archetype, or clears it with null. See `selectFirstArchetype`. */
export function selectSecondArchetype(
  build: BuildPlan,
  id: Id | null,
  schemas: ArchetypeSchemas = ARCHETYPE_SCHEMAS,
): Partial<BuildPlan> {
  if (id === build.secondArchetypeId) return {}
  return { secondArchetypeId: id, secondArchetypeChoicesIds: choicesFor(id, schemas.second) }
}

/** The change that takes or drops the Exemplar. */
export function setExemplar(
  build: BuildPlan,
  isExemplar: boolean,
  schemas: ArchetypeSchemas = ARCHETYPE_SCHEMAS,
): Partial<BuildPlan> {
  if (isExemplar === build.isExemplar) return {}
  return { isExemplar, exemplarArchetypeChoicesIds: isExemplar ? emptyChoices(schemas.exemplar) : [] }
}

/**
 * Whether an archetype change would undo earlier choices, so the user should confirm it first
 * (Architecture §6: Confirming archetype switches). That is when it:
 * - changes or clears the first archetype while it has choices,
 * - changes or clears the second archetype while it has choices, or
 * - changes the first archetype to one that doesn't allow the selected second archetype, which the
 *   validator would then null. Clearing the first archetype keeps the second (decision 007).
 */
export function undoesEarlierChoices(
  build: BuildPlan,
  change: Partial<BuildPlan>,
  firstArchetypes: readonly FirstArchetypeEntry[] = FIRST_ARCHETYPES,
): boolean {
  const changesFirst = change.firstArchetypeId !== undefined && change.firstArchetypeId !== build.firstArchetypeId
  const changesSecond = change.secondArchetypeId !== undefined && change.secondArchetypeId !== build.secondArchetypeId

  if (changesFirst && hasChoices(build.firstArchetypeChoicesIds)) return true
  if (changesSecond && hasChoices(build.secondArchetypeChoicesIds)) return true

  if (changesFirst && build.secondArchetypeId !== null) {
    const newFirst = firstArchetypes.find((entry) => entry.id === change.firstArchetypeId) ?? null
    return newFirst !== null && !availableSecondArchetypeIds(newFirst).includes(build.secondArchetypeId)
  }
  return false
}

function hasChoices(choices: readonly (Choice | null)[]): boolean {
  return choices.some((choice) => choice !== null)
}

function choicesFor(id: Id | null, tierSchemas: ReadonlyMap<Id, Schema>): null[] {
  if (id === null) return []
  const schema = tierSchemas.get(id)
  if (schema === undefined) throw new Error(`No schema for archetype ${id}`)
  return emptyChoices(schema)
}
