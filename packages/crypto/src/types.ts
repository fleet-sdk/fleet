export type BytesInput = Uint8Array | string;

export interface Coder<F, T> {
  encode(from: F): T;
  decode(to: T): F;
}

export interface BytesCoder extends Coder<Uint8Array, string> {
  /**
   * Encodes an array of bytes to a string
   */
  encode: (data: Uint8Array) => string;
  /**
   * Decodes a string to an array of bytes
   */
  decode: (str: string) => Uint8Array;
}
