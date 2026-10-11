/** The format version written at the start of every link. See Architecture §4.1. */
export const FORMAT_VERSION = 1

/** Bit widths of the fixed-width fields. See Architecture §4.2. */
export const FIELD_BITS = {
  version: 4,
  characterId: 5,
  homeworldId: 4,
  originId: 5,
  triumphId: 4,
  darkestHourId: 4,
  startingCharacteristicIncrease: 4,
  firstArchetypeId: 4,
  secondArchetypeId: 4,
  isExemplar: 1,
} as const
