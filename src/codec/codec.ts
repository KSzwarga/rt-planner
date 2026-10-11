import {
  type BuildPlan,
  type Choice,
  emptyBuildPlan,
  type Id,
  STARTING_CHARACTERISTIC_INCREASES,
} from '../model/buildPlan'
import { choiceSlots, type Schema } from '../model/schema'
import { choiceSlotBits } from '../model/slotKinds'
import { base64urlToBits, bitsToBase64url } from './base64url'
import { BitReader, BitWriter } from './bits'
import { DecodeError } from './errors'
import { FIELD_BITS, FORMAT_VERSION } from './layout'

/** The schemas the codec needs to lay out the archetype choices. */
export interface ArchetypeSchemas {
  readonly first: ReadonlyMap<Id, Schema>
  readonly second: ReadonlyMap<Id, Schema>
  readonly exemplar: Schema
}

type ArchetypeTier = 'first' | 'second'

/**
 * Encodes a build into the URL-safe string stored in the link. Trailing all-zero characters are
 * dropped, since the decoder reads missing bits as null.
 *
 * Throws if the build is malformed: an ID that doesn't fit its field, an unknown archetype, or a
 * choices array that doesn't match its schema. A build coming from the validator never is.
 */
export function encodeBuild(plan: BuildPlan, schemas: ArchetypeSchemas): string {
  const writer = new BitWriter()
  writer.write(FORMAT_VERSION, FIELD_BITS.version)

  writeId(writer, plan.characterId, FIELD_BITS.characterId)
  writeId(writer, plan.homeworldId, FIELD_BITS.homeworldId)
  writeId(writer, plan.originId, FIELD_BITS.originId)
  writeId(writer, plan.triumphId, FIELD_BITS.triumphId)
  writeId(writer, plan.darkestHourId, FIELD_BITS.darkestHourId)

  if (plan.startingCharacteristicIncreasesIds.length !== STARTING_CHARACTERISTIC_INCREASES) {
    throw new Error(
      `Expected ${STARTING_CHARACTERISTIC_INCREASES} starting characteristic increases, got ${plan.startingCharacteristicIncreasesIds.length}`,
    )
  }
  for (const id of plan.startingCharacteristicIncreasesIds) {
    writeId(writer, id, FIELD_BITS.startingCharacteristicIncrease)
  }

  writeArchetype(writer, 'first', plan.firstArchetypeId, plan.firstArchetypeChoicesIds, schemas.first)
  writeArchetype(writer, 'second', plan.secondArchetypeId, plan.secondArchetypeChoicesIds, schemas.second)

  writer.write(plan.isExemplar ? 1 : 0, FIELD_BITS.isExemplar)
  if (plan.isExemplar) {
    writeChoices(writer, 'Exemplar', plan.exemplarArchetypeChoicesIds, schemas.exemplar)
  } else {
    expectNoChoices('Exemplar', plan.exemplarArchetypeChoicesIds)
  }

  return bitsToBase64url(writer.finish()).replace(/A+$/, '')
}

/**
 * Decodes a link into a raw build. The result is not validated: IDs that fit their field but
 * don't exist in their table, or illegal choices, are left for the validator to null.
 *
 * An unknown archetype ID is the one exception. Without its schema, the decoder can't tell how
 * many bits its choices take, so that archetype and everything after it are left empty, and a
 * warning is logged.
 *
 * Throws `DecodeError` if the text isn't base64url, or its format version is unsupported.
 */
export function decodeBuild(text: string, schemas: ArchetypeSchemas): BuildPlan {
  const reader = new BitReader(base64urlToBits(text))

  const version = reader.read(FIELD_BITS.version)
  if (version !== FORMAT_VERSION) {
    throw new DecodeError(`Unsupported format version: ${version}`)
  }

  const plan = emptyBuildPlan()
  plan.characterId = readId(reader, FIELD_BITS.characterId)
  plan.homeworldId = readId(reader, FIELD_BITS.homeworldId)
  plan.originId = readId(reader, FIELD_BITS.originId)
  plan.triumphId = readId(reader, FIELD_BITS.triumphId)
  plan.darkestHourId = readId(reader, FIELD_BITS.darkestHourId)
  plan.startingCharacteristicIncreasesIds = Array.from({ length: STARTING_CHARACTERISTIC_INCREASES }, () =>
    readId(reader, FIELD_BITS.startingCharacteristicIncrease),
  )

  const first = readArchetype(reader, 'first', schemas.first)
  if (first === undefined) {
    return plan
  }
  plan.firstArchetypeId = first.id
  plan.firstArchetypeChoicesIds = first.choices

  const second = readArchetype(reader, 'second', schemas.second)
  if (second === undefined) {
    return plan
  }
  plan.secondArchetypeId = second.id
  plan.secondArchetypeChoicesIds = second.choices

  plan.isExemplar = reader.read(FIELD_BITS.isExemplar) === 1
  if (plan.isExemplar) {
    plan.exemplarArchetypeChoicesIds = readChoices(reader, schemas.exemplar)
  }

  return plan
}

function writeId(writer: BitWriter, id: Id | null, width: number): void {
  if (id === 0) {
    throw new RangeError('ID 0 is reserved for null')
  }
  writer.write(id ?? 0, width)
}

function readId(reader: BitReader, width: number): Id | null {
  const id = reader.read(width)
  return id === 0 ? null : id
}

function writeArchetype(
  writer: BitWriter,
  tier: ArchetypeTier,
  id: Id | null,
  choices: readonly (Choice | null)[],
  table: ReadonlyMap<Id, Schema>,
): void {
  writeId(writer, id, FIELD_BITS[`${tier}ArchetypeId`])
  if (id === null) {
    expectNoChoices(`${tier} archetype`, choices)
    return
  }
  const schema = table.get(id)
  if (schema === undefined) {
    throw new Error(`Unknown ${tier} archetype ID: ${id}`)
  }
  writeChoices(writer, `${tier} archetype`, choices, schema)
}

/** Returns `undefined` when the ID is unknown, so decoding has to stop. */
function readArchetype(
  reader: BitReader,
  tier: ArchetypeTier,
  table: ReadonlyMap<Id, Schema>,
): { id: Id | null; choices: (Choice | null)[] } | undefined {
  const id = readId(reader, FIELD_BITS[`${tier}ArchetypeId`])
  if (id === null) {
    return { id: null, choices: [] }
  }
  const schema = table.get(id)
  if (schema === undefined) {
    console.warn(`Unknown ${tier} archetype ID ${id}: it and everything after it in the link were dropped.`)
    return undefined
  }
  return { id, choices: readChoices(reader, schema) }
}

function writeChoices(
  writer: BitWriter,
  owner: string,
  choices: readonly (Choice | null)[],
  schema: Schema,
): void {
  const slots = choiceSlots(schema)
  if (choices.length !== slots.length) {
    throw new Error(`The ${owner} schema has ${slots.length} choice slots, but got ${choices.length} choices`)
  }
  slots.forEach((slot, index) => writeId(writer, choices[index], choiceSlotBits(slot.kind)))
}

function readChoices(reader: BitReader, schema: Schema): (Choice | null)[] {
  return choiceSlots(schema).map((slot) => readId(reader, choiceSlotBits(slot.kind)))
}

function expectNoChoices(owner: string, choices: readonly (Choice | null)[]): void {
  if (choices.length > 0) {
    throw new Error(`The ${owner} is not selected, but has ${choices.length} choices`)
  }
}
