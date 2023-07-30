import { assert, assertInstanceOf, assertTypeOf } from "@fleet-sdk/common";
import { BytesCoder } from "../types";

const HEXES = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

function bytesToHex(bytes: Uint8Array): string {
  assertInstanceOf(bytes, Uint8Array);

  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += HEXES[bytes[i]];
  }

  return hex;
}

function hexToBytes(hex: string): Uint8Array {
  assertTypeOf(hex, "string");
  assert(hex.length % 2 === 0, "Invalid hex padding.");

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = parseInt(hexByte, 16);
    assert(!isNaN(byte) && byte >= 0, "Invalid byte sequence.");

    bytes[i] = byte;
  }

  return bytes;
}

export const hex: BytesCoder = {
  encode: bytesToHex,
  decode: hexToBytes
};
