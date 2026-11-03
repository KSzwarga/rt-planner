import { ABILITIES } from './abilities'
import { CHARACTERISTIC } from './characteristics'
import { FIRST_ARCHETYPE } from './firstArchetypes'
import { ORIGIN } from './originIds'
import { SECOND_ARCHETYPE } from './secondArchetypes'
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
 * The archetype talent prerequisites come from the GameFAQs guide's "Talents (Basic Archetypes)" and
 * "Talents (Advanced Archetypes)" pages. Hardened Scars needs Endure, which is the Warrior's level 3
 * keystone, not a talent or an ability. Every Warrior talent slot comes after it, so that
 * prerequisite always holds and has no entry. A familiar talent's "<Familiar> Proficiency"
 * prerequisite is its list instead: it is only offered with that familiar (Availability Rules: Familiar).
 */
export const TALENT_REQUIREMENTS: ReadonlyMap<Id, readonly Requirement[]> = new Map([
  requires('Heavy Armour Proficiency', [{ kind: 'characteristic', id: CHARACTERISTIC.STR, min: 45 }]),
  // Every advanced skill talent needs its base skill talent first.
  ...SKILLS.map((skill) => requires(`Advanced Skill: ${skill.name}`, [talent(`Base Skill: ${skill.name}`)])),

  // Weapon proficiencies and the talents that build on them. A slot's level is the character level.
  // The guide's "Lore (Xenos)" means the skill: a Lore (Xenos) skill increase or Base Skill: Lore (Xenos).
  ...['Bolter', 'Flame', 'Melta', 'Plasma'].map((weapon) =>
    requires(`${weapon} Weapon Proficiency`, [{ kind: 'level', min: 4 }]),
  ),
  requires('Heavy Weapon Proficiency', [{ kind: 'level', min: 5 }]),
  ...['Aeldari', 'Drukhari'].map((weapon) =>
    requires(`${weapon} Weapon Proficiency`, [
      { kind: 'level', min: 22 },
      { kind: 'anyOf', of: [{ kind: 'skillIncrease', id: SKILL.LORE_XENOS }, talent('Base Skill: Lore (Xenos)')] },
    ]),
  ),
  requires('Bolt Weapon Expert', [talent('Bolter Weapon Proficiency')]),
  requires('Flame Weapon Expert', [talent('Flame Weapon Proficiency')]),
  requires('Melta Weapon Expert', [talent('Melta Weapon Proficiency')]),
  requires('Plasma Weapon Expert', [talent('Plasma Weapon Proficiency')]),
  requires('Finesse', [
    { kind: 'anyOf', of: [talent('Aeldari Weapon Proficiency'), talent('Drukhari Weapon Proficiency')] },
  ]),
  requires('Deadly Accuracy', [talent('Aeldari Weapon Proficiency')]),
  requires('Poetry of Pain', [talent('Drukhari Weapon Proficiency')]),
  ...['Enhanced Splash Area', 'External Power Block', 'Piercing Charge', 'Plasma Bank', 'Safety Training'].map((name) =>
    requires(name, [talent('Plasma Weapon Proficiency')]),
  ),
  requires('Breaking Point', [{ kind: 'level', min: 15 }, talent('Heavy Weapon Proficiency')]),
  requires('Overpower', [{ kind: 'level', min: 15 }, talent('Heavy Weapon Proficiency')]),
  requires('Power Armour Proficiency', [{ kind: 'characteristic', id: CHARACTERISTIC.STR, min: 45 }]),
  // The guide's "Dual-Weapon Specialist" and "Melee Weapon Specialist" are the wiki's Dual Weapon
  // Specialist and Weapon Specialist.
  requires('Dual Weapon Specialist', [talent('Dual-Weapon Combat'), talent('Weapon Specialist')]),

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

  // Assassin
  requires('Morbid Pirouette', [ability('Danse Macabre')]),
  requires('Carmine Whisper', [ability('Death Whisper')]),
  requires('Elusive Speed', [ability('Elusive Shadow')]),
  requires('Gruesome Gust', [ability('Feinting Attack')]),
  requires('Flawless Lunge', [ability('Poised to Strike')]),

  // Vanguard. Counter-Attack Stance needs the Defensive Stance ability, not the Warrior talent of that name.
  requires('Covering Bulwark', [ability('Bulwark')]),
  requires('Counter-Attack Stance', [ability('Defensive Stance')]),
  requires('Offensive Follow', [ability('Follow My Lead')]),
  requires('On Your Feet!', [ability('Forced Distraction')]),
  requires('Overwhelming Provocation', [ability('Provocation')]),
  requires('Wall of Ferrocrete', [ability('Wall of Rockcrete')]),

  // Bounty Hunter
  requires('Claim and Maim', [ability('Claim the Bounty')]),
  requires('Flay the Bold', [ability('Cull the Bold')]),
  requires('Trail and Shatter', [ability('Hot on the Trail')]),
  requires('Pierce and Ruin', [ability('Piercing Shot')]),
  requires('Kill Squad', [ability('Raid')]),

  // Master Tactician. Stronghold needs the Strongpoint ability, not the Grand Strategist talent of that name.
  requires('Primary Objective', [ability('Assign Objective')]),
  requires('Perfect Finish', [ability('Finish the Job')]),
  requires('Unwavering Motivation', [ability('Inspire')]),
  requires('Reliance', [ability('Linchpin')]),
  requires('Stronghold', [ability('Strongpoint')]),

  // Grand Strategist
  requires('Supporting Zone', [firstArchetype(FIRST_ARCHETYPE.officer)]),
  requires('Blurred Locus', [ability('Combat Locus Stratagem')]),
  requires('Inescapable Zone', [ability('Killzone Stratagem')]),
  requires('Daunting Zone', [ability('Overwhelming Stratagem')]),
  requires('Overcoming Zone', [ability('Stronghold Stratagem')]),
  requires('Fortress Zone', [ability('Trenchline Stratagem')]),

  // Arch-Militant
  requires('Survivor', [ability('Cautious Approach')]),
  requires('Calm and Steady', [ability('Confident Approach')]),
  requires('Breaking Attack', [ability('Devastating Attack')]),
  requires('Martial Art', [ability('Kick')]),
  requires('All Out', [ability('Reckless Rush')]),
  requires('Flashfire', [ability('Wildfire')]),

  // Executioner
  requires('Bleeding Stigmata', [ability('Exsanguination')]),
  requires('Revelling in Suffering', [ability('Gift of Torment')]),
  requires('Death Warrant', [ability('Merciless Verdict')]),
  requires('Everlasting Agony', [ability('Pain Resonance')]),
  requires('Reprieve', [ability('Reckless Abandon')]),
  requires('Unbearable Presence', [ability('Terrifying Strike')]),

  // Overseer: cyber-mastiff and servo-skull swarm talents that also need a first archetype.
  requires('Ammunition Bags', [firstArchetype(FIRST_ARCHETYPE.soldier)]),
  requires('Joint Hunting', [firstArchetype(FIRST_ARCHETYPE.warrior)]),
  requires('Precise Mauling', [firstArchetype(FIRST_ARCHETYPE.operative)]),
  requires('Shared Blood', [firstArchetype(FIRST_ARCHETYPE.bladedancer)]),
  requires('Special Training', [firstArchetype(FIRST_ARCHETYPE.officer)]),
  // "Bring It Down! ability": the Officer's keystone feature, so it means the Officer archetype.
  requires('Energy Multiplier', [firstArchetype(FIRST_ARCHETYPE.officer)]),
  requires('Kinetic Module', [firstArchetype(FIRST_ARCHETYPE.officer)]),
  // Galvanic Module also needs "Manipulus", which the planner has no data for, so it has no entry.

  // Exemplar
  ...[
    'Adamantine Alloys',
    'Autonomous Protection Algorithms',
    'Emergency Algorithms',
    'Mercy of the Omnissiah',
    'Poison Dispersal System',
  ].map((name) => requires(name, [secondArchetype(SECOND_ARCHETYPE.overseer)])),
  // Unsanctioned psykers: any origin other than a Sanctioned Psyker.
  ...['Biomancy', 'Divination', 'Pyromancy', 'Sanctic Powers', 'Telepathy'].map((discipline) =>
    requires(`Psychic Awakening (${discipline})`, [
      {
        kind: 'noneOf',
        of: [
          ORIGIN.sanctionedPsykerBiomancer,
          ORIGIN.sanctionedPsykerDiviner,
          ORIGIN.sanctionedPsykerPyromancer,
          ORIGIN.sanctionedPsykerSanctic,
          ORIGIN.sanctionedPsykerTelepath,
        ].map((id) => ({ kind: 'origin', id })),
      },
    ]),
  ),
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

function firstArchetype(id: Id): Requirement {
  return { kind: 'archetype', tier: 'first', id }
}

function secondArchetype(id: Id): Requirement {
  return { kind: 'archetype', tier: 'second', id }
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
