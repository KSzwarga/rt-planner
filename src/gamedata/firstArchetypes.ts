import type { FirstArchetypeEntry } from './types'

/** First archetypes cover levels 1–15. */
export const FIRST_ARCHETYPES: readonly FirstArchetypeEntry[] = [
  {
    id: 1,
    name: 'Soldier',
    archetypeTalentList: 'soldier',
    archetypeAbilityList: 'soldier',
    allowedSecondArchetypeIds: [1],
    schema: {
      1: ['runAndGunKeystoneFeature'],
      2: ['skillIncrease'],
      3: ['revelInSlaughterKeystoneFeature'],
      4: ['firearmMasteryUltimateKeystoneFeature', 'firstArchetypeTalent'],
      5: ['characteristicIncrease', 'firstArchetypeTalent'],
      6: ['characteristicIncrease', 'firstArchetypeAbility'],
      7: ['characteristicIncrease', 'commonTalent'],
      8: ['firstArchetypeTalent', 'skillIncrease'],
      9: ['firearmMasteryUpgrade'],
      10: ['firstArchetypeTalent', 'characteristicIncrease'],
      11: ['firstArchetypeAbility', 'skillIncrease'],
      12: ['characteristicIncrease', 'commonTalent'],
      13: ['firstArchetypeTalent', 'commonTalent'],
      14: ['commonTalent', 'skillIncrease'],
      15: ['firearmMasteryUpgrade'],
    },
  },
]
