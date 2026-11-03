import type { FamiliarEntry } from './types'

/** Familiar IDs by key. Part of the URL format: stored by the Overseer's `familiar` slot. */
export const FAMILIAR = {
  cyberMastiff: 1,
  psyberRaven: 2,
  servoSkullSwarm: 3,
  cyberEagle: 4,
} as const

/**
 * The Overseer's familiars, from the wiki's Overseer page. Each has its own talent and ability list,
 * and its own Overcharge.
 */
export const FAMILIARS: readonly FamiliarEntry[] = [
  {
    id: FAMILIAR.cyberMastiff,
    name: 'Cyber-Mastiff',
    abbreviation: 'CM',
    description: 'The Overseer fights alongside a cyber-mastiff, with its own set of talents and abilities.',
    talentList: 'cyberMastiff',
    abilityList: 'cyberMastiff',
    ultimateHeroicAct:
      "The cyber-mastiff immediately heals to full wounds (even if it has 0 wounds). The Overseer's next three abilities cost -1 AP. Until the end of combat, the cyber-mastiff deals additional damage equal to +Familiar's WS bonus% of the target's maximum wounds.",
    ultimateDesperateMeasures:
      "As the Heroic Act, but the cyber-mastiff's maximum wounds are reduced by 50%, and Reactivate now consumes all of the Overseer's MP.",
  },
  {
    id: FAMILIAR.psyberRaven,
    name: 'Psyber-Raven',
    abbreviation: 'PR',
    description: 'The Overseer fights alongside a psyber-raven, with its own set of talents and abilities.',
    talentList: 'psyberRaven',
    abilityList: 'psyberRaven',
    ultimateHeroicAct:
      "The psyber-raven immediately heals to full wounds (even if it has 0 wounds). The Overseer's next three abilities cost -1 AP. Until the end of combat, the Overseer can relay attacking psychic powers through their psyber-raven.",
    ultimateDesperateMeasures:
      "As the Heroic Act, but the psyber-raven's maximum wounds are reduced by 50%, and Reactivate now spends all of the Overseer's MP.",
  },
  {
    id: FAMILIAR.servoSkullSwarm,
    name: 'Servo-Skull Swarm',
    abbreviation: 'SSS',
    description: 'The Overseer fights alongside a servo-skull swarm, with its own set of talents and abilities.',
    talentList: 'servoSkullSwarm',
    abilityList: 'servoSkullSwarm',
    ultimateHeroicAct:
      "The servo-skull swarm immediately heals to full wounds (even if it has 0 wounds). The Overseer's next three abilities cost -1 AP. Until the end of combat, the Overseer's allies ignore the cover of enemies under surveillance. Additionally, allies within a 4-cell radius of the servo-skull swarm are immune to critical hits.",
    ultimateDesperateMeasures:
      "As the Heroic Act, but the servo-skull swarm's maximum wounds are reduced by 50%, and Reactivate now spends all of the Overseer's MP.",
  },
  {
    id: FAMILIAR.cyberEagle,
    name: 'Cyber-Eagle',
    abbreviation: 'CE',
    description: 'The Overseer fights alongside a cyber-eagle, with its own set of talents and abilities.',
    talentList: 'cyberEagle',
    abilityList: 'cyberEagle',
    ultimateHeroicAct:
      "The cyber-eagle immediately heals to full wounds (even if it has 0 wounds). The Overseer's next three abilities cost -1 AP. Until the end of combat, an obstructed enemy's attacks directed at the cyber-eagle that hit that enemy's allies automatically score critical hits.",
    ultimateDesperateMeasures:
      "As the Heroic Act, but the cyber-eagle's maximum wounds are reduced by 50%, and Reactivate now spends all of the Overseer's MP.",
  },
]
