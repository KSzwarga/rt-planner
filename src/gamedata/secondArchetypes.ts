import type { SecondArchetypeEntry } from './types'

/** Second archetypes cover levels 16–35. */
export const SECOND_ARCHETYPES: readonly SecondArchetypeEntry[] = [
  {
    id: 1,
    name: 'Executioner',
    archetypeTalentList: 'executioner',
    archetypeAbilityList: 'executioner',
    schema: {
      16: ['killingEdgeKeystoneFeature'],
      17: ['secondArchetypeTalent', 'skillIncrease'],
      18: ['characteristicIncrease', 'secondArchetypeAbility'],
      19: ['secondArchetypeTalent', 'commonTalent'],
      20: ['cullTheWeakUltimateKeystoneFeature'],
      21: ['characteristicIncrease', 'skillIncrease'],
      22: ['secondArchetypeTalent', 'commonTalent'],
      23: ['secondArchetypeAbility', 'skillIncrease'],
      24: ['cullTheWeakUpgrade'],
      25: ['characteristicIncrease', 'secondArchetypeTalent'],
      26: ['commonTalent', 'skillIncrease'],
      27: ['secondArchetypeTalent', 'characteristicIncrease'],
      28: ['secondArchetypeAbility', 'skillIncrease'],
      29: ['characteristicIncrease', 'commonTalent'],
      30: ['cullTheWeakUpgrade'],
      31: ['secondArchetypeTalent', 'skillIncrease'],
      32: ['characteristicIncrease', 'commonTalent'],
      33: ['secondArchetypeTalent', 'secondArchetypeAbility'],
      34: ['commonTalent', 'skillIncrease'],
      35: ['cullTheWeakUpgrade'],
    },
  },
]
