import {
  base58 as base58Coder,
  base64 as base64Coder,
  hex as hexCoder,
  utf8 as utf8Coder
} from "@scure/base";

export interface Coder<F, T> {
  encode(from: F): T;
  decode(to: T): F;
}

export interface BytesCoder extends Coder<Uint8Array, string> {
  encode: (data: Uint8Array) => string;
  decode: (str: string) => Uint8Array;
}

export const base58 = base58Coder as BytesCoder;
export const hex = hexCoder as BytesCoder;
export const utf8 = utf8Coder as BytesCoder;
export const base64 = base64Coder as BytesCoder;
