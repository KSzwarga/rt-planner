import type { AbilityEntry, CharacteristicEntry, Requirement, SkillEntry, TalentEntry } from '../gamedata/types'

/** The tables a requirement's IDs are named from. */
export interface RequirementNames {
  readonly talents: readonly TalentEntry[]
  readonly abilities: readonly AbilityEntry[]
  readonly characteristics: readonly CharacteristicEntry[]
  readonly skills: readonly SkillEntry[]
}

/**
 * A requirement in words, such as "STR 45", "Base Skill: Athletics", "Medicae skill increase" or
 * "level 10". Used by the validator's log and the level-up screen's requirements box.
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
    case 'anyOf':
      return `one of (${requirement.of.map((option) => requirementText(option, names)).join(', ')})`
  }
}
