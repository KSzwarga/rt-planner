import { describe, expect, it } from 'vitest'
import { base64urlToBits, bitsToBase64url } from './base64url'
import { DecodeError } from './errors'

describe('bitsToBase64url', () => {
  it('writes an empty stream as an empty string', () => {
    expect(bitsToBase64url({ value: 0n, length: 0 })).toBe('')
  })

  it('writes 6 bits per character, most significant first', () => {
    expect(bitsToBase64url({ value: 0b000100_111111n, length: 12 })).toBe('E_')
  })

  it('pads only the last character with zero bits', () => {
    // 0001 → 000100
    expect(bitsToBase64url({ value: 0b0001n, length: 4 })).toBe('E')
    // 000100 01 → 000100 010000
    expect(bitsToBase64url({ value: 0b00010001n, length: 8 })).toBe('EQ')
  })

  it('keeps leading zero characters', () => {
    expect(bitsToBase64url({ value: 0b1n, length: 12 })).toBe('AB')
  })

  it('uses the URL-safe alphabet', () => {
    expect(bitsToBase64url({ value: 0b111110_111111n, length: 12 })).toBe('-_')
  })
})

describe('base64urlToBits', () => {
  it('reads an empty string as an empty stream', () => {
    expect(base64urlToBits('')).toEqual({ value: 0n, length: 0 })
  })

  it('reads 6 bits per character, including padding', () => {
    expect(base64urlToBits('EQ')).toEqual({ value: 0b000100_010000n, length: 12 })
  })

  it('keeps leading zero characters in the length', () => {
    expect(base64urlToBits('AB')).toEqual({ value: 1n, length: 12 })
  })

  it('reads back what was written, for a whole number of characters', () => {
    const bits = { value: 0x0123456789abcdefn, length: 66 }
    expect(base64urlToBits(bitsToBase64url(bits))).toEqual(bits)
  })

  it.each(['+', '/', '=', ' ', 'é'])('rejects "%s"', (char) => {
    expect(() => base64urlToBits(`E${char}`)).toThrow(DecodeError)
  })
})
