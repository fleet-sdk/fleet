import { assertInstanceOf, assertTypeOf } from "@fleet-sdk/common";
import { BytesCoder } from "../types";

/**
 * Converts bytes to utf8 string
 * @param bytes
 */
function bytesToUtf8(bytes: Uint8Array): string {
  assertInstanceOf(bytes, Uint8Array);

  return new TextDecoder().decode(bytes);
}

/**
 * Converts utf8 string to bytes
 * @param str
 * @returns
 */
function utf8ToBytes(str: string): Uint8Array {
  assertTypeOf(str, "string");

  return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}

export const utf8: BytesCoder = {
  encode: bytesToUtf8,
  decode: utf8ToBytes
};
