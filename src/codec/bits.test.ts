import { describe, expect, it } from 'vitest'
import { BitReader, BitWriter } from './bits'

describe('BitWriter', () => {
  it('starts empty', () => {
    expect(new BitWriter().finish()).toEqual({ value: 0n, length: 0 })
  })

  it('writes the first field into the most significant bits', () => {
    const writer = new BitWriter()
    writer.write(0b0001, 4)
    writer.write(0b11, 2)
    expect(writer.finish()).toEqual({ value: 0b000111n, length: 6 })
  })

  it('packs fields back to back with no alignment', () => {
    const writer = new BitWriter()
    writer.write(0b100101100, 9)
    writer.write(0b101, 3)
    writer.write(0b1, 1)
    expect(writer.finish()).toEqual({ value: 0b1001011001011n, length: 13 })
  })

  it('keeps leading zero fields in the length', () => {
    const writer = new BitWriter()
    writer.write(0, 4)
    writer.write(0, 9)
    expect(writer.finish()).toEqual({ value: 0n, length: 13 })
  })

  it('accepts the largest value that fits', () => {
    const writer = new BitWriter()
    writer.write(511, 9)
    expect(writer.finish()).toEqual({ value: 511n, length: 9 })
  })

  it.each([
    { value: 16, width: 4, reason: 'too large' },
    { value: -1, width: 4, reason: 'negative' },
    { value: 1.5, width: 4, reason: 'not an integer' },
  ])('rejects a value that is $reason', ({ value, width }) => {
    expect(() => new BitWriter().write(value, width)).toThrow(RangeError)
  })

  it.each([0, -1, 2.5])('rejects width %d', (width) => {
    expect(() => new BitWriter().write(0, width)).toThrow(RangeError)
  })
})

describe('BitReader', () => {
  it('reads fields in the order they were written', () => {
    const reader = new BitReader({ value: 0b1001011001011n, length: 13 })
    expect(reader.read(9)).toBe(0b100101100)
    expect(reader.read(3)).toBe(0b101)
    expect(reader.read(1)).toBe(0b1)
  })

  it('reads leading zero fields', () => {
    const reader = new BitReader({ value: 0b0011n, length: 8 })
    expect(reader.read(4)).toBe(0)
    expect(reader.read(4)).toBe(0b0011)
  })

  it('returns 0 once past the end of the stream', () => {
    const reader = new BitReader({ value: 0b1111n, length: 4 })
    reader.read(4)
    expect(reader.read(9)).toBe(0)
    expect(reader.read(1)).toBe(0)
  })

  it('reads an empty stream as zeros', () => {
    expect(new BitReader({ value: 0n, length: 0 }).read(4)).toBe(0)
  })

  it('fills a field that runs past the end with trailing zeros', () => {
    const reader = new BitReader({ value: 0b11011n, length: 5 })
    reader.read(2)
    expect(reader.read(5)).toBe(0b01100)
  })

  it('reads back everything a writer wrote', () => {
    const fields: [value: number, width: number][] = [
      [1, 4],
      [300, 9],
      [0, 4],
      [255, 8],
      [4, 3],
      [1, 1],
      [13, 4],
    ]
    const writer = new BitWriter()
    for (const [value, width] of fields) {
      writer.write(value, width)
    }
    const reader = new BitReader(writer.finish())
    expect(fields.map(([, width]) => reader.read(width))).toEqual(fields.map(([value]) => value))
  })

  it.each([0, -1, 2.5])('rejects width %d', (width) => {
    expect(() => new BitReader({ value: 0n, length: 0 }).read(width)).toThrow(RangeError)
  })
})
