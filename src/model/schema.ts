import { type ChoiceSlotKind, isKeystoneFeature, type SlotKind } from './slotKinds'

/** An archetype's progression: the slots granted at each level, in order. See Architecture §4.3. */
export type Schema = Readonly<Record<number, readonly SlotKind[]>>

/** A slot that holds a user choice. Its position in `choiceSlots` is its index in the choices array. */
export interface ChoiceSlot {
  readonly level: number
  readonly kind: ChoiceSlotKind
}

/**
 * The choice slots of a schema, in the order they are encoded and replayed: levels ascending, and
 * slots in array order within each level. Keystone features are left out.
 */
export function choiceSlots(schema: Schema): ChoiceSlot[] {
  const levels = Object.keys(schema)
    .map(Number)
    .sort((a, b) => a - b)

  const slots: ChoiceSlot[] = []
  for (const level of levels) {
    for (const kind of schema[level]) {
      if (!isKeystoneFeature(kind)) {
        slots.push({ level, kind })
      }
    }
  }
  return slots
}
