/** A table entry ID. Real entries start at 1, because 0 is reserved for null. */
export type Id = number

/** A selection in an archetype slot: an ID in the table of that slot's kind. */
export type Choice = Id

/** Number of starting characteristic increases. Every build has exactly this many entries. */
export const STARTING_CHARACTERISTIC_INCREASES = 6

/**
 * The persisted build. It holds choices only, and is the object the codec writes into the URL.
 *
 * Each `*ChoicesIds` array has one entry per choice slot of that archetype's schema, in schema
 * order (see `choiceSlots`). Keystone features have no entry. An archetype that is not selected
 * has an empty array.
 */
export interface BuildPlan {
  /** The companion this build is for. Null means the Rogue Trader, the main character and the default. */
  characterId: Id | null
  homeworldId: Id | null
  originId: Id | null
  triumphId: Id | null
  darkestHourId: Id | null
  startingCharacteristicIncreasesIds: (Id | null)[]

  firstArchetypeId: Id | null
  firstArchetypeChoicesIds: (Choice | null)[]

  secondArchetypeId: Id | null
  secondArchetypeChoicesIds: (Choice | null)[]

  isExemplar: boolean
  exemplarArchetypeChoicesIds: (Choice | null)[]
}

/** A build with nothing selected. */
export function emptyBuildPlan(): BuildPlan {
  return {
    characterId: null,
    homeworldId: null,
    originId: null,
    triumphId: null,
    darkestHourId: null,
    startingCharacteristicIncreasesIds: Array<Id | null>(STARTING_CHARACTERISTIC_INCREASES).fill(null),

    firstArchetypeId: null,
    firstArchetypeChoicesIds: [],

    secondArchetypeId: null,
    secondArchetypeChoicesIds: [],

    isExemplar: false,
    exemplarArchetypeChoicesIds: [],
  }
}
