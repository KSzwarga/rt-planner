import type { Schema } from '../model/schema'
import type { ListKey } from './types'

/** How the Exemplar is shown, with the same fields as an archetype entry. */
export const EXEMPLAR = { name: 'Exemplar', abbreviation: 'EX' } as const

/** The Exemplar's schema (levels 36–55). Not defined yet, so for now the Exemplar has no choices. */
export const EXEMPLAR_SCHEMA: Schema = {}

/** The talent list of the Exemplar's own talent slots (`exemplarArchetypeTalent`). */
export const EXEMPLAR_TALENT_LIST: ListKey = 'exemplar'
