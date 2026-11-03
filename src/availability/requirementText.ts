import type {
  AbilityEntry,
  CharacteristicEntry,
  FirstArchetypeEntry,
  OriginEntry,
  Requirement,
  SecondArchetypeEntry,
  SkillEntry,
  TalentEntry,
} from '../gamedata/types'

/** The tables a requirement's IDs are named from. */
export interface RequirementNames {
  readonly talents: readonly TalentEntry[]
  readonly abilities: readonly AbilityEntry[]
  readonly characteristics: readonly CharacteristicEntry[]
  readonly skills: readonly SkillEntry[]
  readonly firstArchetypes: readonly FirstArchetypeEntry[]
  readonly secondArchetypes: readonly SecondArchetypeEntry[]
  readonly origins: readonly OriginEntry[]
}

/**
 * A requirement in words, such as "STR 45", "Base Skill: Athletics", "Medicae skill increase",
 * "the Officer archetype" or "level 10". Used by the validator's log and the level-up screen's
 * requirements box.
 */
export function requirementText(requirement: Requirement, names: RequirementNames): string {
  switch (requirement.kind) {
    case 'level':
      return `level ${requirement.min}`
    case 'talent':
      return names.talents.find((talent) => talent.id === requirement.id)?.name ?? `talent ${requirement.id}`
    case 'ability':
      return names.abilities.find((ability) => ability.id === requirement.id)?.name ?? `ability ${requirement.id}`
    case 'characteristic': {
      const characteristic = names.characteristics.find((entry) => entry.id === requirement.id)
      return `${characteristic?.abbreviation ?? `characteristic ${requirement.id}`} ${requirement.min}`
    }
    case 'skillIncrease': {
      const skill = names.skills.find((entry) => entry.id === requirement.id)
      return `${skill?.name ?? `skill ${requirement.id}`} skill increase`
    }
    case 'archetype': {
      const archetypes = requirement.tier === 'first' ? names.firstArchetypes : names.secondArchetypes
      const archetype = archetypes.find((entry) => entry.id === requirement.id)
      return `the ${archetype?.name ?? `${requirement.tier} archetype ${requirement.id}`} archetype`
    }
    case 'origin': {
      const origin = names.origins.find((entry) => entry.id === requirement.id)
      return `the ${origin?.name ?? `origin ${requirement.id}`} origin`
    }
    case 'anyOf':
      return `one of (${requirement.of.map((option) => requirementText(option, names)).join(', ')})`
    case 'noneOf':
      return `none of (${requirement.of.map((option) => requirementText(option, names)).join(', ')})`
  }
}
