import type { HexString } from "@fleet-sdk/common";

export type ByteInput = Uint8Array | HexString;

export interface Coder<F, T> {
  encode(decoded: F): T;
  decode(encoded: T): F;
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
