/**
 * A bitstream held in a `BigInt`. The first bit written is the most significant one, so the
 * stream reads left to right in the same order it was written.
 */
export interface Bits {
  readonly value: bigint
  readonly length: number
}

function mask(width: number): bigint {
  return (1n << BigInt(width)) - 1n
}

/** Packs unsigned fields back to back, with no gaps or alignment. */
export class BitWriter {
  private value = 0n
  private length = 0

  /** Appends `value` as a `width`-bit field. */
  write(value: number, width: number): void {
    if (!Number.isInteger(width) || width <= 0) {
      throw new RangeError(`Invalid field width: ${width}`)
    }
    if (!Number.isInteger(value) || value < 0 || BigInt(value) > mask(width)) {
      throw new RangeError(`Value ${value} does not fit in ${width} bits`)
    }
    this.value = (this.value << BigInt(width)) | BigInt(value)
    this.length += width
  }

  finish(): Bits {
    return { value: this.value, length: this.length }
  }
}

/** Reads fields in the order they were written. Past the end of the stream, every bit reads as 0. */
export class BitReader {
  private readonly bits: Bits
  private position = 0

  constructor(bits: Bits) {
    this.bits = bits
  }

  /** Reads the next `width`-bit field. */
  read(width: number): number {
    if (!Number.isInteger(width) || width <= 0) {
      throw new RangeError(`Invalid field width: ${width}`)
    }
    const { value, length } = this.bits
    const start = this.position
    const end = start + width
    this.position = end

    if (start >= length) {
      return 0
    }
    if (end <= length) {
      return Number((value >> BigInt(length - end)) & mask(width))
    }
    // The field runs past the end: take the bits that are there, and fill the rest with zeros.
    const available = length - start
    return Number((value & mask(available)) << BigInt(width - available))
  }
}
