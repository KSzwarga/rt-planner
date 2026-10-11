import type { Bits } from './bits'
import { DecodeError } from './errors'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const BITS_PER_CHAR = 6
const CHAR_MASK = (1n << BigInt(BITS_PER_CHAR)) - 1n

const CHAR_VALUES: ReadonlyMap<string, bigint> = new Map(
  [...ALPHABET].map((char, index) => [char, BigInt(index)]),
)

/** Writes 6 bits per character, most significant first. Only the last character is padded with zero bits. */
export function bitsToBase64url({ value, length }: Bits): string {
  const charCount = Math.ceil(length / BITS_PER_CHAR)
  const padded = value << BigInt(charCount * BITS_PER_CHAR - length)

  let text = ''
  for (let i = charCount - 1; i >= 0; i--) {
    text += ALPHABET[Number((padded >> BigInt(i * BITS_PER_CHAR)) & CHAR_MASK)]
  }
  return text
}

/** Reads 6 bits per character. Padding bits are kept, so `length` is always a multiple of 6. */
export function base64urlToBits(text: string): Bits {
  let value = 0n
  for (const char of text) {
    const charValue = CHAR_VALUES.get(char)
    if (charValue === undefined) {
      throw new DecodeError(`Invalid base64url character: "${char}"`)
    }
    value = (value << BigInt(BITS_PER_CHAR)) | charValue
  }
  return { value, length: text.length * BITS_PER_CHAR }
}
