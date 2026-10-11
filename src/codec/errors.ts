/** A link that can't be decoded at all: bad characters or an unsupported format version. */
export class DecodeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DecodeError'
  }
}
