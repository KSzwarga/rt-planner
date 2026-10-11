import { CHARACTERISTIC } from './characteristics'
import { SKILLS } from './skills'
import { TALENTS } from './talents'
import type { Requirement } from './types'
import type { Id } from '../model/buildPlan'

/**
 * What each talent needs before it can be selected (Availability Rules: Rule 2), by talent ID.
 * A talent with no entry has no requirements. Kept apart from `talents.ts`, which is generated from
 * the wiki, so regenerating it never loses these. Talents are written by name and resolved to IDs
 * here, which throws on a name that isn't in the talent table.
 */
export const TALENT_REQUIREMENTS: ReadonlyMap<Id, readonly Requirement[]> = new Map([
  requires('Heavy Armour Proficiency', [{ kind: 'characteristic', id: CHARACTERISTIC.STR, min: 45 }]),
  // Every advanced skill talent needs its base skill talent first.
  ...SKILLS.map((skill) => requires(`Advanced Skill: ${skill.name}`, [talent(`Base Skill: ${skill.name}`)])),
])

/** The requirements of a talent. Empty when it has none. */
export function talentRequirements(talentId: Id): readonly Requirement[] {
  return TALENT_REQUIREMENTS.get(talentId) ?? []
}

function requires(talentName: string, requirements: readonly Requirement[]): [Id, readonly Requirement[]] {
  return [talentId(talentName), requirements]
}

function talent(talentName: string): Requirement {
  return { kind: 'talent', id: talentId(talentName) }
}

function talentId(name: string): Id {
  const entry = TALENTS.find((candidate) => candidate.name === name)
  if (entry === undefined) throw new Error(`Unknown talent in requirements: ${name}`)
  return entry.id
}
