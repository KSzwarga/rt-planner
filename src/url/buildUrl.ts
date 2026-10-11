import { type ArchetypeSchemas, decodeBuild, encodeBuild } from '../codec/codec'
import { DecodeError } from '../codec/errors'
import { EXEMPLAR_SCHEMA } from '../gamedata/exemplar'
import { FIRST_ARCHETYPES } from '../gamedata/firstArchetypes'
import { SECOND_ARCHETYPES } from '../gamedata/secondArchetypes'
import { type BuildPlan, emptyBuildPlan } from '../model/buildPlan'
import { validateBuild } from '../validation/validator'

/** The game's archetype schemas, as the codec takes them. */
export const ARCHETYPE_SCHEMAS: ArchetypeSchemas = {
  first: new Map(FIRST_ARCHETYPES.map((archetype) => [archetype.id, archetype.schema])),
  second: new Map(SECOND_ARCHETYPES.map((archetype) => [archetype.id, archetype.schema])),
  exemplar: EXEMPLAR_SCHEMA,
}

/**
 * Reads the build from a location hash (`#…`, Architecture §2): decode, then validate, so illegal
 * selections come back null. An empty or unreadable hash gives an empty build.
 */
export function buildFromHash(hash: string, schemas: ArchetypeSchemas = ARCHETYPE_SCHEMAS): BuildPlan {
  const text = hash.replace(/^#/, '')
  if (text === '') return emptyBuildPlan()

  try {
    return validateBuild(decodeBuild(text, schemas))
  } catch (error) {
    if (!(error instanceof DecodeError)) throw error
    console.warn(`Ignored an unreadable link: ${error.message}`)
    return emptyBuildPlan()
  }
}

/** The location hash for a build. An empty build has none, so the plain address is an empty planner. */
export function hashFromBuild(build: BuildPlan, schemas: ArchetypeSchemas = ARCHETYPE_SCHEMAS): string {
  const text = encodeBuild(build, schemas)
  return text === encodeBuild(emptyBuildPlan(), schemas) ? '' : `#${text}`
}
