import { ABILITIES } from './abilities'
import { CHARACTERISTIC } from './characteristics'
import { SKILL, SKILLS } from './skills'
import { TALENTS } from './talents'
import type { Requirement } from './types'
import type { Id } from '../model/buildPlan'

/**
 * What each talent needs before it can be selected (Availability Rules: Rule 2), by talent ID.
 * A talent with no entry has no requirements. Kept apart from `talents.ts`, which is generated from
 * the wiki, so regenerating it never loses these. Talents and abilities are written by name and
 * resolved to IDs here, which throws on a name that isn't in its table.
 *
 * The archetype talent prerequisites come from the GameFAQs guide's "Talents (Basic Archetypes)"
 * page. Hardened Scars needs Endure, which is the Warrior's level 3 keystone, not a talent or an
 * ability. Every Warrior talent slot comes after it, so that prerequisite always holds and has no entry.
 */
export const TALENT_REQUIREMENTS: ReadonlyMap<Id, readonly Requirement[]> = new Map([
  requires('Heavy Armour Proficiency', [{ kind: 'characteristic', id: CHARACTERISTIC.STR, min: 45 }]),
  // Every advanced skill talent needs its base skill talent first.
  ...SKILLS.map((skill) => requires(`Advanced Skill: ${skill.name}`, [talent(`Base Skill: ${skill.name}`)])),

  // Warrior
  requires('Blade Flurry', [ability('Break Through')]),
  requires('Shearing Strikes', [ability('Break Through')]),
  requires('Reckless Fury', [ability('Reckless Strike')]),
  requires('Invigorating Hatred', [ability('Sworn Enemy')]),

  // Officer
  requires('Inspiring Speech', [ability('Air of Authority')]),
  requires('Prepare for an Assault!', [ability('Break Their Ranks!')]),
  requires('Wounds Are No Excuse!', [ability('Get Back in the Fight!')]),
  requires('Watch Yourself!', [ability('Move, Move, Move!')]),
  requires('Steady!', [ability('Take Aim!')]),

  // Operative
  requires('Terrifying Presence', [ability('Intimidation')]),
  requires('Sniper Expertise', [ability('Perfect Spot')]),
  requires('Informed Hit', [ability('Precise Attack')]),
  requires('Insightful Precision', [ability('Precise Attack')]),
  requires('Improved Tactics', [ability('Tactical Knowledge')]),

  // Soldier
  // "Medicae skill or Field Medic". The Medicae skill is a Medicae skill increase or Base Skill: Medicae.
  // Field Medic is a Warrior talent missing from the talent table. A Soldier never has the Warrior
  // list, so leaving it out changes nothing for now.
  requires('Combat Medicae', [
    { kind: 'anyOf', of: [{ kind: 'skillIncrease', id: SKILL.MEDICAE }, talent('Base Skill: Medicae')] },
  ]),
  requires('Forewarning', [ability('Controlled Shot')]),
  requires('Tactical Disengage', [ability('Dash')]),
  requires('On the Double', [ability('Entrench')]),
  requires('Unfaltering Fire', [ability('Rapid Fire')]),

  // Bladedancer
  requires('Slip Away', [ability('Acrobatic Artistry')]),
  requires('Promises of Blood', [ability('Blood Oath')]),
  requires('Grand Performance', [ability('Captive Audience')]),
  requires('Blood Bonds', [ability('Oath of Vengeance')]),
  requires('Anticipation', [ability('Veil of Blades')]),
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

function ability(abilityName: string): Requirement {
  return { kind: 'ability', id: abilityId(abilityName) }
}

function talentId(name: string): Id {
  const entry = TALENTS.find((candidate) => candidate.name === name)
  if (entry === undefined) throw new Error(`Unknown talent in requirements: ${name}`)
  return entry.id
}

function abilityId(name: string): Id {
  const entry = ABILITIES.find((candidate) => candidate.name === name)
  if (entry === undefined) throw new Error(`Unknown ability in requirements: ${name}`)
  return entry.id
}
